import { QueueItem } from './types';

export class QueueManager {
  private queue: QueueItem[] = [];

  public add(item: QueueItem): void {
    this.queue.push(item);
  }

  public getNext(): QueueItem | undefined {
    return this.queue.shift();
  }

  public clear(): void {
    this.queue = [];
  }
}
