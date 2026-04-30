import { LOG_PREFIX } from './constants';

export class TimeoutManager {
  private activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private maxTimeouts = 10;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanup();
  }

  create(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    if (this.activeTimeouts.size >= this.maxTimeouts) {
      console.warn(`${LOG_PREFIX} Maximum timeouts reached, clearing oldest`);
      this.clearOldest(Math.floor(this.maxTimeouts / 2));
    }

    const timeout = setTimeout(() => {
      this.activeTimeouts.delete(timeout);
      try {
        callback();
      } catch (error) {
        console.error(`${LOG_PREFIX} Timeout callback error:`, error);
      }
    }, delay);

    this.activeTimeouts.add(timeout);
    return timeout;
  }

  clearAll(): void {
    this.activeTimeouts.forEach((t) => clearTimeout(t));
    this.activeTimeouts.clear();
  }

  clearOldest(count: number): void {
    const timeouts = Array.from(this.activeTimeouts);
    for (let i = 0; i < Math.min(count, timeouts.length); i++) {
      clearTimeout(timeouts[i]);
      this.activeTimeouts.delete(timeouts[i]);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      if (this.activeTimeouts.size > this.maxTimeouts) {
        console.log(`${LOG_PREFIX} Cleaning up excess timeouts: ${this.activeTimeouts.size}`);
        this.clearOldest(this.activeTimeouts.size - this.maxTimeouts);
      }
    }, 30000);
  }

  dispose(): void {
    this.clearAll();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
