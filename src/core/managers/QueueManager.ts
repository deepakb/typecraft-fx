import { QueueItem, QueueActionType, TypecraftContext } from '../../types';
import { ErrorHandler } from '../../utils/ErrorHandler';
import { ErrorSeverity } from '../error/TypecraftError';
import { ITypecraftLogger } from '../logging/TypecraftLogger';

export interface IQueueManager {
  add(item: QueueItem): void;
  getNext(): QueueItem | undefined;
  clear(): void;
  isEmpty(): boolean;
  size(): number;
  addPause(ms: number): void;
  addFunction(callback: () => void): void;
  processQueue(context: TypecraftContext): Promise<void>;
}

export class QueueManager implements IQueueManager {
  private queue: QueueItem[] = [];

  constructor(
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler
  ) {}

  public add(item: QueueItem): void {
    if (!item || typeof item !== 'object') {
      this.errorHandler.handleError(
        new Error('Invalid queue item'),
        'Cannot add null, undefined, or non-object item to the queue',
        { item },
        ErrorSeverity.HIGH
      );
    }
    this.queue.push(item);
    this.logger.debug('Item added to queue', { queueSize: this.queue.length });
  }

  public getNext(): QueueItem | undefined {
    this.logger.debug('Getting next item from queue', { queueSize: this.queue.length });
    if (this.isEmpty()) {
      this.logger.debug('Attempted to get next item from empty queue');
      return undefined;
    }
    const item = this.queue.shift();
    this.logger.debug('Item retrieved from queue', { remainingQueueSize: this.queue.length });
    return item;
  }

  public clear(): void {
    const previousSize = this.queue.length;
    this.queue = [];
    this.logger.debug('Queue cleared', { previousSize });
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public size(): number {
    return this.queue.length;
  }

  public addPause(ms: number): void {
    if (typeof ms !== 'number' || ms < 0) {
      this.errorHandler.handleError(
        new Error('Invalid pause duration'),
        'Pause duration must be a non-negative number',
        { ms },
        ErrorSeverity.HIGH
      );
    }
    this.add({ type: QueueActionType.PAUSE, payload: { ms } });
    this.logger.debug('Pause added to queue', { ms });
  }

  public addFunction(callback: () => void): void {
    if (typeof callback !== 'function') {
      this.errorHandler.handleError(
        new Error('Invalid callback'),
        'Callback must be a function',
        { callback },
        ErrorSeverity.HIGH
      );
    }
    this.add({ type: QueueActionType.CALL_FUNCTION, payload: { callback } });
    this.logger.debug('Function added to queue');
  }

  public async processQueue(context: TypecraftContext): Promise<void> {
    while (!this.isEmpty()) {
      const queueItem = this.getNext();
      if (queueItem) {
        await this.executeQueueItem(queueItem, context);
      }
    }
    this.logger.info('Queue processing completed');
  }

  private async executeQueueItem(item: QueueItem, context: TypecraftContext): Promise<void> {
    try {
      if (item.execute) {
        await item.execute();
      } else {
        await this.executeQueueItemByType(item, context);
      }
    } catch (error) {
      this.errorHandler.handleError(
        error,
        'Failed to execute queue item',
        { item },
        ErrorSeverity.HIGH
      );
    }
  }

  private async executeQueueItemByType(item: QueueItem, context: TypecraftContext): Promise<void> {
    switch (item.type) {
      case QueueActionType.TYPE:
      case QueueActionType.TYPE_CHARACTER:
        await context.typeCharacter(item.payload);
        break;
      case QueueActionType.TYPE_HTML_TAG_OPEN:
        await context.typeHtmlTagOpen(item.payload);
        break;
      case QueueActionType.TYPE_HTML_CONTENT:
        await context.typeHtmlContent(item.payload.content);
        break;
      case QueueActionType.TYPE_HTML_TAG_CLOSE:
        await context.typeHtmlTagClose(item.payload);
        break;
      case QueueActionType.DELETE:
      case QueueActionType.DELETE_CHARACTERS:
        const state = context.getState();
        if (state.visibleNodes.length > 0) {
          await context.deleteChars(1);
        } else {
          this.logger.warn('Delete skipped: No visible nodes');
          context.emit('deleteSkipped');
        }
        break;
      case QueueActionType.PAUSE:
        await context.wait(item.payload.ms);
        break;
      case QueueActionType.CALLBACK:
      case QueueActionType.CALL_FUNCTION:
        if (typeof item.payload.callback === 'function') {
          await Promise.resolve(item.payload.callback());
        }
        break;
      case QueueActionType.LOOP:
        const { startIndex, endIndex } = item.payload;
        const { strings, fixedStringsIndexes, pauseFor, loop } = context.options;

        for (let i = startIndex; i <= endIndex; i++) {
          if (!fixedStringsIndexes?.includes(i)) {
            await context.typeString(strings[i]);
            await context.wait(pauseFor);
            if (i < endIndex || loop) {
              await context.deleteChars(strings[i].length);
            }
          }
        }

        if (loop) {
          this.add(item);
        }
        break;
      default:
        this.logger.warn('Unknown queue action type', { type: item.type });
    }
  }
}
