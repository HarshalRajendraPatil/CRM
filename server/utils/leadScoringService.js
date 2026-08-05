/**
 * leadScoringService.js
 *
 * Hybrid AI Lead Scoring Engine — combines a deterministic rule-based scorer
 * (always runs, zero latency, zero cost) with an optional LLM qualitative
 * scorer (OpenRouter, free models) when an API key is configured.
 *
 * Architecture (per PRD §5):
 *   Lead Created/Updated
 *       │
 *       ▼
 *   gatherSignals()  — query Lead + Activity for raw signal data
 *       │
 *       ▼
 *   runRuleEngine()  — deterministic weighted rules → numeric sub-score
 *       │
 *       ▼
 *   runLLMEngine()   — qualitative LLM assessment → qualitative sub-score
 *   (only when OPENROUTER_API_KEY is set — gracefully skipped otherwise)
 *       │
 *       ▼
 *   blendScores()    — 60% rule + 40% LLM when both available
 *       │
 *       ▼
 *   persist()        — update Lead + insert ScoreHistory row
 *       │
 *       ▼
 *   logActivity()    — write "Score changed X→Y" to activity feed
 */

import Lead from '../models/Lead.model.js';
import ScoreHistory from '../models/ScoreHistory.model.js';
import Activity from '../models/Activity.model.js';
import AIService from './aiService.js';
import { leadScoringPrompt } from './prompts.js';

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT RULE WEIGHTS (PRD §4.2)
// Admins can override these per project via scoring config (future §4.3 feature)
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_RULES = [
  // ── Source quality ──────────────────────────────────────────────────────
  { key: 'source_referral', points: +20, label: 'Referral source' },
  { key: 'source_event', points: +15, label: 'Event lead' },
  { key: 'source_email', points: +10, label: 'Email campaign' },
  { key: 'source_web', points: +8, label: 'Website lead' },
  { key: 'source_phone', points: +8, label: 'Phone enquiry' },
  { key: 'source_ads', points: +5, label: 'Ad campaign' },
  // source = other → no adjustment

  // ── Response speed ───────────────────────────────────────────────────────
  { key: 'fast_response', points: +15, label: 'First contact within 1 day' },
  { key: 'slow_response', points: -10, label: 'First contact took 3+ days' },

  // ── Touch / engagement ───────────────────────────────────────────────────
  { key: 'high_touch', points: +10, label: '3+ interactions logged' },
  { key: 'note_written', points: +5, label: 'Notes added by rep' },

  // ── Recency / decay ──────────────────────────────────────────────────────
  { key: 'stale_5d', points: -15, label: 'No activity in 5+ days' },
  { key: 'stale_14d', points: -30, label: 'No activity in 14+ days (stale)' },

  // ── Lead profile completeness ────────────────────────────────────────────
  { key: 'has_email', points: +5, label: 'Email address provided' },
  { key: 'has_phone', points: +5, label: 'Phone number provided' },
  { key: 'has_job_title', points: +5, label: 'Job title provided' },
  { key: 'has_company', points: +5, label: 'Company name provided' },

  // ── Stage progression ────────────────────────────────────────────────────
  // Bonus points are given for reaching later stages (dynamic — checked against stage order)
  { key: 'advanced_stage', points: +10, label: 'Lead has advanced in pipeline' },
  { key: 'early_stage', points: 0, label: 'Lead at initial stage' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL GATHERER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collect all scoring signals from the database for a given lead.
 *
 * @param {Object} lead - Mongoose Lead document (must be populated)
 * @param {Array}  stagesList - Array of pipeline stage objects [{_id, name, order}]
 * @returns {Object} signals - Plain object of signal values (saved as signalsSnapshot)
 */
async function gatherSignals(lead, stagesList = []) {
  const now = new Date();
  const createdAt = new Date(lead.createdAt);
  const daysSinceCreation = Math.floor((now - createdAt) / 86400000);

  // Activity log
  let activities = [];
  try {
    activities = await Activity.find({
      entityType: 'Lead',
      entityId: lead._id,
    }).sort({ createdAt: -1 }).lean();
  } catch (err) {
    // Activity collection may not exist yet — gracefully degrade
    console.warn('[LeadScoring] Could not fetch activities:', err.message);
  }

  const touchCount = activities.length;

  // Days since last activity
  const lastActivity = activities.length > 0 ? new Date(activities[0].createdAt) : createdAt;
  const daysSinceLastActivity = Math.floor((now - lastActivity) / 86400000);

  // First touch (response speed)
  const firstActivity = activities.length > 0 ? new Date(activities[activities.length - 1].createdAt) : null;
  const hoursToFirstContact = firstActivity
    ? (firstActivity - createdAt) / 3600000
    : null;

  // Note count
  const noteCount = lead.notes?.length || 0;

  // Stage position — find where the current stage falls in the ordered pipeline
  const currentStageId = lead.stage || lead.status;
  const stageIndex = stagesList.findIndex(s => s._id?.toString() === currentStageId?.toString());
  const stageOrder = stageIndex >= 0 ? stageIndex + 1 : 1;
  const totalStages = stagesList.length || 1;
  const isAdvancedStage = stageOrder > Math.floor(totalStages / 2);

  // Stage name for display / LLM context
  const currentStage = stagesList[stageIndex];
  const stageName = currentStage?.name || currentStageId || 'Unknown';

  // Recent notes text for LLM
  const recentNotesSummary = (lead.notes || [])
    .slice(-3)
    .map(n => `[${new Date(n.createdAt).toLocaleDateString()}] ${n.content}`)
    .join('\n') || '';

  return {
    source: lead.source,
    daysSinceCreation,
    daysSinceLastActivity,
    hoursToFirstContact,
    touchCount,
    noteCount,
    hasEmail: !!lead.email,
    hasPhone: !!lead.phone,
    hasJobTitle: !!lead.jobTitle,
    hasCompany: !!(lead.companyName || lead.company),
    stageOrder,
    totalStages,
    isAdvancedStage,
    stageName,
    recentNotesSummary,
    tags: lead.tags || [],
    name: lead.name,
    jobTitle: lead.jobTitle,
    companyName: lead.companyName || lead.company?.name,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RULE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluate rule-based signals and produce a clamped 0-100 score.
 *
 * @param {Object} signals - Output of gatherSignals()
 * @returns {{ score: number, firedRules: Array<{label, points}> }}
 */
function runRuleEngine(signals) {
  let base = 40; // neutral baseline for a brand-new lead
  const firedRules = [];

  const fire = (key, points, label) => {
    base += points;
    firedRules.push({ key, points, label });
  };

  // Source
  if (signals.source === 'referral') fire('source_referral', +20, 'Referral source (+20)');
  else if (signals.source === 'event') fire('source_event', +15, 'Event lead (+15)');
  else if (signals.source === 'email') fire('source_email', +10, 'Email campaign (+10)');
  else if (signals.source === 'web') fire('source_web', +8, 'Website lead (+8)');
  else if (signals.source === 'phone') fire('source_phone', +8, 'Phone enquiry (+8)');
  else if (signals.source === 'ads') fire('source_ads', +5, 'Ad campaign (+5)');

  // Response speed
  if (signals.hoursToFirstContact !== null) {
    if (signals.hoursToFirstContact <= 24) fire('fast_response', +15, 'First contact ≤1 day (+15)');
    else if (signals.hoursToFirstContact > 72) fire('slow_response', -10, 'First contact 3+ days (−10)');
  }

  // Engagement depth
  if (signals.touchCount >= 3) fire('high_touch', +10, `${signals.touchCount} interactions (+10)`);
  if (signals.noteCount > 0) fire('note_written', +5, `${signals.noteCount} notes (+5)`);

  // Decay (stale lead detection)
  if (signals.daysSinceLastActivity > 14) fire('stale_14d', -30, 'No activity 14+ days (−30)');
  else if (signals.daysSinceLastActivity > 5) fire('stale_5d', -15, 'No activity 5+ days (−15)');

  // Profile completeness
  if (signals.hasEmail) fire('has_email', +5, 'Email provided (+5)');
  if (signals.hasPhone) fire('has_phone', +5, 'Phone provided (+5)');
  if (signals.hasJobTitle) fire('has_job_title', +5, 'Job title provided (+5)');
  if (signals.hasCompany) fire('has_company', +5, 'Company provided (+5)');

  // Stage progression
  if (signals.isAdvancedStage) fire('advanced_stage', +10, `Advanced pipeline stage (${signals.stageName}) (+10)`);

  const score = Math.min(100, Math.max(0, Math.round(base)));
  return { score, firedRules };
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM ENGINE (optional — gracefully skipped when no API key)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ask the LLM for a qualitative sub-score based on note sentiment and context.
 *
 * @param {Object} signals
 * @param {number} ruleScore - The rule-based score for context
 * @returns {Promise<{ score: number, reason: string } | null>}
 */
async function runLLMEngine(signals, ruleScore) {
  if (!process.env.OPENROUTER_API_KEY) {
    return null; // LLM scoring disabled — no key configured
  }

  try {
    const prompt = leadScoringPrompt({ ...signals, ruleScore });
    const raw = await AIService.callOpenRouter(
      prompt,
      'You are an expert sales analyst. Return only valid JSON — no markdown, no code fences.'
    );
    if (!raw) return null;
    console.log(raw)

    const clean = raw.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (typeof parsed.score === 'number' && typeof parsed.reason === 'string') {
      return {
        score: Math.min(100, Math.max(0, Math.round(parsed.score))),
        reason: parsed.reason,
      };
    }
  } catch (err) {
    console.warn('[LeadScoring] LLM engine failed — falling back to rule-based score:', err.message);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// BLENDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Blend rule-based and LLM scores.
 * Weights: 60% rule (deterministic) + 40% LLM (qualitative) — configurable.
 */
function blendScores(ruleScore, llmResult) {
  if (!llmResult) {
    return { finalScore: ruleScore, method: 'rule_based', llmScore: null };
  }
  const finalScore = Math.round(0.6 * ruleScore + 0.4 * llmResult.score);
  return {
    finalScore: Math.min(100, Math.max(0, finalScore)),
    method: 'hybrid',
    llmScore: llmResult.score,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REASON BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a human-readable score explanation string.
 *
 * @param {Array}  firedRules  - Array of fired rule objects
 * @param {number} finalScore
 * @param {Object|null} llmResult
 * @param {string} method
 * @returns {string}
 */
function buildReason(firedRules, finalScore, llmResult, method) {
  const ruleText = firedRules.length > 0
    ? firedRules.map(r => r.label).join(', ')
    : 'No strong signals detected';

  if (method === 'hybrid' && llmResult?.reason) {
    return `Rule signals: ${ruleText}. AI insight: ${llmResult.reason} → Score: ${finalScore}`;
  }
  return `${ruleText} → Score: ${finalScore}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save the computed score to the Lead document and insert a ScoreHistory row.
 *
 * @param {Object} lead          - Mongoose Lead document
 * @param {number} finalScore
 * @param {string} reason
 * @param {string} method
 * @param {Object} signals       - Raw signals snapshot
 * @param {number|null} ruleScore
 * @param {number|null} llmScore
 * @param {string} trigger
 */
async function persist(lead, finalScore, reason, method, signals, ruleScore, llmScore, trigger) {
  const previousScore = lead.score ?? null;

  // Update the Lead document
  await Lead.findByIdAndUpdate(lead._id, {
    score: finalScore,
    scoreReason: reason,
    scoreUpdatedAt: new Date(),
    scoreMethod: method,
  });

  // Insert ScoreHistory row
  await ScoreHistory.create({
    lead: lead._id,
    project: lead.project,
    score: finalScore,
    previousScore,
    reason,
    method,
    signalsSnapshot: signals,
    ruleScore,
    llmScore,
    trigger,
    computedAt: new Date(),
  });

  return { previousScore, finalScore };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOGGER
// ─────────────────────────────────────────────────────────────────────────────

async function logScoreActivity(lead, previousScore, newScore, reason, performedBy) {
  if (previousScore === newScore) return; // no change — skip

  const delta = newScore - (previousScore ?? newScore);
  const direction = delta > 0 ? `↑ +${delta}` : `↓ ${delta}`;

  try {
    await Activity.create({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_score_updated',
      description: `Score ${direction} (${previousScore ?? '?'} → ${newScore}): ${reason}`,
      category: 'update',
      performedBy: performedBy || lead.owner,
      priority: Math.abs(delta) >= 15 ? 'high' : 'low',
      metadata: { previousScore, newScore, delta, reason },
    });
  } catch (err) {
    // Don't crash scoring if activity logging fails
    console.warn('[LeadScoring] Activity log failed:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute and persist a new score for a lead.
 *
 * This is the single entry-point used by all triggers (create, update,
 * decay job, manual recompute). It is idempotent — safe to call multiple times.
 *
 * @param {string|Object} leadIdOrDoc  - Lead _id string OR populated Lead document
 * @param {Array}  stagesList          - Pipeline stages array from Project
 * @param {string} trigger             - Why this is running (created|updated|...)
 * @param {Object|null} performedBy    - User who triggered (null for scheduled)
 * @returns {Promise<{ score, reason, method }>}
 */
export async function computeLeadScore(lead = {}, stagesList = [], trigger = 'updated', performedBy = null) {
  if (!lead) {
    console.warn('[LeadScoring] Lead not found — skipping scoring');
    return null;
  }

  try {
    // 1. Gather signals
    const signals = await gatherSignals(lead, stagesList);

    // 2. Rule engine (always)
    const { score: ruleScore, firedRules } = runRuleEngine(signals);

    // 3. LLM engine (optional — async, does not block if it fails)
    const llmResult = await runLLMEngine(signals, ruleScore);

    // 4. Blend
    const { finalScore, method, llmScore } = blendScores(ruleScore, llmResult);

    // 5. Build reason
    const reason = buildReason(firedRules, finalScore, llmResult, method);

    // 6. Persist
    const { previousScore } = await persist(
      lead, finalScore, reason, method, signals, ruleScore, llmScore, trigger
    );

    // 7. Activity log
    await logScoreActivity(lead, previousScore, finalScore, reason, performedBy?._id || performedBy);

    console.log(`[LeadScoring] ${lead.name} → ${finalScore} (${method}) [${trigger}]`);
    return { score: finalScore, reason, method };

  } catch (err) {
    console.error(`[LeadScoring] Failed to score lead ${lead._id}:`, err);
    return null;
  }
}

/**
 * Run the nightly decay job: re-score all active leads to apply staleness decay.
 * Called by the scheduler — safe to call from a cron-style interval.
 *
 * @returns {Promise<{ processed: number, updated: number }>}
 */
export async function runDecayJob() {
  console.log('[LeadScoring] Starting nightly decay job…');
  const leads = await Lead.find({ isArchived: false, convertedAt: null }).lean();

  let processed = 0;
  let updated = 0;

  for (const lead of leads) {
    const result = await computeLeadScore(lead, [], 'scheduled_decay', null);
    processed++;
    if (result) updated++;

    // Slight delay between leads to avoid hammering the DB
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`[LeadScoring] Decay job complete: ${updated}/${processed} leads updated`);
  return { processed, updated };
}
