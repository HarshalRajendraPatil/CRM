import { processAllReminders } from "./reminderService.js";
import { runDecayJob } from "./leadScoringService.js";

/**
 * Scheduler — manages recurring background jobs:
 *  1. Reminder processing (every 5 minutes)
 *  2. Lead score decay (nightly at ~2 AM, or every 6h in development)
 */
class Scheduler {
  constructor() {
    this.reminderInterval = null;
    this.decayInterval = null;
    this.isRunning = false;
  }

  /**
   * Start all scheduled jobs.
   */
  start() {
    if (this.isRunning) {
      console.log("Scheduler is already running");
      return;
    }

    console.log("Starting scheduler...");

    // ── 1. Reminders every 5 minutes ────────────────────────────────────────
    this.reminderInterval = setInterval(async () => {
      try {
        const result = await processAllReminders();
        console.log(`[Scheduler] Reminders processed: ${JSON.stringify(result)}`);
      } catch (error) {
        console.error("[Scheduler] Error in reminder job:", error);
      }
    }, 5 * 60 * 1000);

    // Run reminders immediately on start
    this.processReminders();

    // ── 2. Lead score decay ──────────────────────────────────────────────────
    // Run every 6 hours in dev, nightly (24h) in production.
    // This re-evaluates staleness signals (days_since_last_activity) even when
    // leads aren't explicitly updated.
    const decayIntervalMs = process.env.NODE_ENV === 'production'
      ? 24 * 60 * 60 * 1000  // 24 hours
      : 6 * 60 * 60 * 1000;   // 6 hours (easier to test in dev)

    this.decayInterval = setInterval(async () => {
      try {
        console.log("[Scheduler] Starting lead score decay job…");
        const result = await runDecayJob();
        console.log(`[Scheduler] Decay complete: ${result.updated}/${result.processed} leads rescored`);
      } catch (error) {
        console.error("[Scheduler] Error in decay job:", error);
      }
    }, decayIntervalMs);

    this.isRunning = true;
    console.log("Scheduler started successfully");
  }

  /**
   * Stop all scheduled jobs.
   */
  stop() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
    this.isRunning = false;
    console.log("Scheduler stopped");
  }

  /**
   * Process reminders immediately (used on startup).
   */
  async processReminders() {
    try {
      const result = await processAllReminders();
      console.log("[Scheduler] Initial reminders processed:", result);
      return result;
    } catch (error) {
      console.error("[Scheduler] Error processing reminders:", error);
    }
  }
}

// Singleton
const scheduler = new Scheduler();
export default scheduler;
