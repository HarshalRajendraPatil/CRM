/**
 * prompts.js — Central repository for all AI prompts used across CRM features.
 *
 * Each prompt is a function that takes context data and returns a fully-formatted
 * prompt string. This centralised file makes it easy to version, audit, and
 * iterate on prompts without touching business logic files.
 */

// ─────────────────────────────────────────────────────────────────────────────
// LEAD SCORING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prompt for LLM-based qualitative lead scoring.
 * The LLM contributes a qualitative sub-score (0-100) alongside the rule-based
 * numeric score. The two are blended by the scoring service.
 *
 * @param {Object} ctx - Scoring context
 * @param {string} ctx.name - Lead full name
 * @param {string} ctx.jobTitle - Lead job title
 * @param {string} ctx.companyName - Lead company name
 * @param {string} ctx.source - Lead acquisition source
 * @param {string} ctx.stageName - Current pipeline stage name
 * @param {number} ctx.daysSinceCreation - Days since lead was created
 * @param {number} ctx.daysSinceLastActivity - Days since last CRM activity
 * @param {number} ctx.touchCount - Number of logged CRM interactions
 * @param {number} ctx.noteCount - Number of notes written about this lead
 * @param {string[]} ctx.tags - Tags attached to this lead
 * @param {string} ctx.recentNotesSummary - Last 3 notes concatenated as text
 * @param {number} ctx.ruleScore - Score produced by rule-based engine (0-100)
 * @returns {string} The user-facing prompt string
 */
export const leadScoringPrompt = (ctx) => `
You are an expert B2B sales analyst. Your job is to estimate the probability
that a CRM lead will convert to a paying customer, expressed as a score from
0 (very unlikely) to 100 (highly likely).

You are given:
  1. The lead's profile and behavioural data.
  2. A rule-based numeric score already computed (${ctx.ruleScore}/100) — treat
     this as a data signal, not ground truth. You may agree or diverge based on
     qualitative signals such as note sentiment, urgency language, or objections.

## Lead Profile
- Name: ${ctx.name || 'Unknown'}
- Job Title: ${ctx.jobTitle || 'Not provided'}
- Company: ${ctx.companyName || 'Not provided'}
- Source: ${ctx.source || 'other'}
- Current Pipeline Stage: ${ctx.stageName || 'Unknown'}
- Tags: ${ctx.tags?.length ? ctx.tags.join(', ') : 'None'}

## Behavioural Signals
- Days since lead was created: ${ctx.daysSinceCreation ?? 'Unknown'}
- Days since last CRM activity: ${ctx.daysSinceLastActivity ?? 'Unknown'}
- Total interactions logged: ${ctx.touchCount ?? 0}
- Notes written: ${ctx.noteCount ?? 0}

## Recent Notes (qualitative context)
${ctx.recentNotesSummary || 'No notes have been written for this lead yet.'}

## Your Task
Analyse the qualitative signals (tone of notes, engagement pattern, urgency
indicators, objections, role seniority) and return a JSON object with:
  - "score" (integer 0–100): your qualitative conversion likelihood estimate
  - "reason" (string, max 2 sentences): a plain-English explanation of what drove
    this score — what positive signals did you see, and what concerns remain?

Return ONLY valid JSON. No markdown, no code fences, no extra text.

Example output:
{"score": 72, "reason": "Decision-maker title with recent engagement and referral source suggests genuine interest, but no contact in 8 days warrants a follow-up."}
`.trim();


// ─────────────────────────────────────────────────────────────────────────────
// LEAD SUMMARISATION (existing — moved here for centralisation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prompt for generating a concise executive summary + next-best action for a lead.
 *
 * @param {Object} ctx
 * @param {string} ctx.name
 * @param {string} ctx.jobTitle
 * @param {string} ctx.status
 * @param {Array}  ctx.notes - Array of {createdAt, content} objects
 * @returns {string}
 */
export const leadSummaryPrompt = (ctx) => `
Review the lead profile and notes. Provide a concise executive summary
(max 3 sentences) of the lead's current status and recommend the precise
"Next Best Action" for the salesperson.

Lead Data:
- Name: ${ctx.name}
- Title: ${ctx.jobTitle}
- Status: ${ctx.status}

Notes:
${ctx.notes.map(n => `- ${new Date(n.createdAt).toLocaleDateString()}: ${n.content}`).join('\n')}

Return ONLY a valid JSON object in this exact format, no markdown:
{"summary": "...", "nextAction": "..."}
`.trim();


// ─────────────────────────────────────────────────────────────────────────────
// OUTREACH EMAIL DRAFTING (existing — moved here for centralisation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prompt for drafting a personalised outreach email to a lead.
 *
 * @param {Object} ctx
 * @param {string} ctx.name
 * @param {string} ctx.jobTitle
 * @param {string} ctx.companyName
 * @param {Array}  ctx.recentNotes - Last 3 notes (array of {content} objects)
 * @returns {string}
 */
export const outreachEmailPrompt = (ctx) => `
Draft a professional, personalized outreach email to this lead. Keep it
concise, friendly, and focused on driving engagement based on their context.

Lead Name: ${ctx.name}
Job Title: ${ctx.jobTitle}
Company: ${ctx.companyName || 'their company'}

Recent Notes Context:
${ctx.recentNotes.map(n => `- ${n.content}`).join('\n')}

Output ONLY the email text (Subject line and body), with no intro/outro filler text.
`.trim();
