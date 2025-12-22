import { processAllReminders } from "./reminderService.js";

/**
 * Scheduler to process reminders
 */
class Scheduler {
  constructor() {
    this.reminderInterval = null;
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      console.log("Scheduler is already running");
      return;
    }

    console.log("Starting scheduler...");

    // Process reminders every 5 minutes
    this.reminderInterval = setInterval(async () => {
      try {
        console.log("Processing reminders...");
        const result = await processAllReminders();
        console.log(`Reminders processed: ${JSON.stringify(result)}`);
      } catch (error) {
        console.error("Error in reminder scheduler:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Run immediately on start
    this.processReminders();

    this.isRunning = true;
    console.log("Scheduler started successfully");
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }

    this.isRunning = false;
    console.log("Scheduler stopped");
  }

  /**
   * Process reminders immediately
   */
  async processReminders() {
    try {
      const result = await processAllReminders();
      console.log("Reminders processed:", result);
      return result;
    } catch (error) {
      console.error("Error processing reminders:", error);
      throw error;
    }
  }
}

// Create singleton instance
const scheduler = new Scheduler();

export default scheduler;
