import { QueueItem } from './types';
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { logger } from './TypecraftLogger';

export class QueueManager {
  private queue: QueueItem[] = [];

  public add(item: QueueItem): void {
    if (!item) {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Cannot add null or undefined item to the queue',
        ErrorSeverity.HIGH,
        { item }
      );
    }
    this.queue.push(item);
    logger.debug('Item added to queue', { queueSize: this.queue.length });
  }

  public getNext(): QueueItem | undefined {
    logger.debug('Getting next item from queue', { queueSize: this.queue.length });
    if (this.queue.length === 0) {
      logger.debug('Attempted to get next item from empty queue');
      return undefined;
    }
    const item = this.queue.shift();
    logger.debug('Item retrieved from queue', { remainingQueueSize: this.queue.length });
    return item;
  }

  public clear(): void {
    const previousSize = this.queue.length;
    this.queue = [];
    logger.debug('Queue cleared', { previousSize });
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public size(): number {
    return this.queue.length;
  }
}
