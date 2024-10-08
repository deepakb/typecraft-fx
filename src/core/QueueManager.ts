import { QueueItem } from './types';

export class QueueManager {
  private queue: QueueItem[] = [];
  private isRunning: boolean = false;

  public add(item: QueueItem): void {
    this.queue.push(item);
    if (!this.isRunning) {
      this.executeQueue();
    }
  }

  public clear(): void {
    this.queue = [];
    this.isRunning = false;
  }

  private async run(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        await item.execute?.();
      }
    }

    this.isRunning = false;
  }

  public async executeQueue(): Promise<void> {
    await this.run();
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getNextItem(): QueueItem | undefined {
    return this.queue[0];
  }
}
