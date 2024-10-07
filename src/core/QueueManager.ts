import { QueueItem } from './types';

export class QueueManager {
  private queue: QueueItem[] = [];
  private isRunning: boolean = false;

  public add(item: QueueItem): void {
    this.queue.push(item);
    if (!this.isRunning) {
      this.run();
    }
  }

  public clear(): void {
    this.queue = [];
    this.isRunning = false;
  }

  private async run(): Promise<void> {
    this.isRunning = true;
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        await item.execute?.();
      }
    }
    this.isRunning = false;
  }
}
