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

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public getLength(): number {
    return this.queue.length;
  }
}
