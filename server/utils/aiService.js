/**
 * aiService.js — Low-level OpenRouter API client.
 * Business-logic prompts live in utils/prompts.js — NOT in this file.
 * This file only handles the HTTP layer and response parsing.
 */
import { leadSummaryPrompt, outreachEmailPrompt } from './prompts.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// Free models available on OpenRouter:
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
console.log("Model", MODEL)
class AIService {
  /**
   * Generic low-level call to the OpenRouter completions API.
   *
   * @param {string} prompt            - User message
   * @param {string} systemInstruction - Optional system message
   * @param {Object} opts              - Extra options (temperature, model override)
   * @returns {Promise<string|null>}   - Raw text response or null on failure
   */
  static async callOpenRouter(prompt, systemInstruction = '', opts = {}) {
    if (!OPENROUTER_API_KEY) {
      console.warn('[AIService] OPENROUTER_API_KEY is not set — AI features disabled.');
      return null;
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'CRM AI Engine',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: opts.model || MODEL,
          messages,
          temperature: opts.temperature ?? 0.3, // lower = more deterministic for scoring
          max_tokens: opts.maxTokens ?? 512,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[AIService] OpenRouter error ${response.status}:`, errText);
        return null; // don't throw — caller decides how to handle null
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content ?? null;

    } catch (err) {
      console.error('[AIService] Network/parse error:', err.message);
      return null;
    }
  }

  // ─── Higher-level helpers ───────────────────────────────────────────────

  /**
   * Generate a lead summary + next-best-action recommendation.
   * Uses the leadSummaryPrompt from prompts.js.
   */
  static async summarizeLead(leadData, notesData) {
    const prompt = leadSummaryPrompt({
      name: leadData.name,
      jobTitle: leadData.jobTitle,
      status: leadData.status,
      notes: notesData,
    });

    try {
      const raw = await this.callOpenRouter(
        prompt,
        'You are an expert CRM assistant. Output raw JSON only — no markdown.',
        { temperature: 0.4 }
      );
      if (raw) {
        const clean = raw.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(clean);
      }
    } catch (err) {
      console.error('[AIService] summarizeLead error:', err.message);
    }
    return { summary: 'Summary unavailable.', nextAction: 'Review manually.' };
  }

  /**
   * Draft a personalised outreach email.
   * Uses the outreachEmailPrompt from prompts.js.
   */
  static async draftOutreachEmail(leadData, notesData) {
    const prompt = outreachEmailPrompt({
      name: leadData.name,
      jobTitle: leadData.jobTitle,
      companyName: leadData.companyName,
      recentNotes: notesData.slice(-3),
    });

    try {
      const raw = await this.callOpenRouter(prompt, 'You are an expert sales copywriter.', { temperature: 0.6 });
      if (raw) return raw.trim();
    } catch (err) {
      console.error('[AIService] draftOutreachEmail error:', err.message);
    }
    return "Subject: Let's connect\n\nHi there,\n\nI wanted to reach out regarding our previous interactions. Let me know when you're available to chat.\n\nBest,\nSales Team";
  }
}

export default AIService;
