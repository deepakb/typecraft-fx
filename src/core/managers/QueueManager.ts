import { QueueItem, QueueActionType, TypecraftContext, NodeType } from '../../types';
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
      case QueueActionType.DELETE_HTML_NODE:
        await context.deleteHtmlNode(item.payload);
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
        if (context.options.loop) {
          const { startIndex, endIndex } = item.payload;
          const { strings, pauseFor } = context.options;

          for (let i = startIndex; i <= endIndex; i++) {
            await context.typeString(strings[i]);
            await context.wait(pauseFor);
          }

          if (context.options.loop) {
            this.add(item);
          }
        }
        break;
      case QueueActionType.LOOP_LAST_STRING:
        if (context.options.loopLastString) {
          const { stringIndex } = item.payload;
          const lastString = context.options.strings[stringIndex];

          try {
            const currentContent = context.getState().visibleNodes;

            // Process deletion in reverse order with proper HTML handling
            for (let i = currentContent.length - 1; i >= 0; i--) {
              const node = currentContent[i];

              if (node.type === NodeType.HTMLElement) {
                // Get all child nodes recursively
                const childNodes = this.getAllChildNodes(node.node as HTMLElement);

                // Delete children first
                for (const childNode of childNodes.reverse()) {
                  this.add({
                    type: QueueActionType.DELETE_HTML_NODE,
                    payload: {
                      index: currentContent.findIndex((n) => n.node === childNode),
                    },
                  });
                }

                // Then delete the parent node
                this.add({
                  type: QueueActionType.DELETE_HTML_NODE,
                  payload: { index: i },
                });
              } else if (node.type === NodeType.Character) {
                this.add({
                  type: QueueActionType.DELETE_CHARACTERS,
                  payload: { count: 1 },
                });
              }
            }

            // Add pause and continue with the rest of the logic
            this.add({
              type: QueueActionType.PAUSE,
              payload: { ms: context.options.pauseFor },
            });

            // Process new content
            if (context.options.html) {
              // Parse HTML content
              const template = document.createElement('template');
              template.innerHTML = lastString;
              const nodes = Array.from(template.content.childNodes);

              // Process each node
              nodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  this.processHtmlNode(node as Element);
                } else if (node.nodeType === Node.TEXT_NODE) {
                  const text = node.textContent || '';
                  for (const char of text) {
                    this.add({
                      type: QueueActionType.TYPE_CHARACTER,
                      payload: { char },
                    });
                  }
                }
              });
            } else {
              // Process plain text
              for (const char of lastString) {
                this.add({
                  type: QueueActionType.TYPE_CHARACTER,
                  payload: { char },
                });
              }
            }

            // Continue loop if enabled
            if (context.options.loopLastString) {
              this.add(item);
            }
          } catch (error) {
            this.errorHandler.handleError(
              error,
              'Error in LOOP_LAST_STRING',
              { lastString },
              ErrorSeverity.HIGH
            );
          }
        }
        break;
      default:
        this.logger.warn('Unknown queue action type', { type: item.type });
    }
  }

  private processHtmlNode(element: Element): void {
    // Add opening tag
    this.add({
      type: QueueActionType.TYPE_HTML_TAG_OPEN,
      payload: { tagName: element.tagName, attributes: element.attributes },
    });

    // Process child nodes
    Array.from(element.childNodes).forEach((childNode) => {
      if (childNode.nodeType === Node.TEXT_NODE) {
        const text = childNode.textContent || '';
        for (const char of text) {
          this.add({
            type: QueueActionType.TYPE_CHARACTER,
            payload: { char },
          });
        }
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        this.processHtmlNode(childNode as Element);
      }
    });

    // Add closing tag
    this.add({
      type: QueueActionType.TYPE_HTML_TAG_CLOSE,
      payload: { tagName: element.tagName },
    });
  }

  private getAllChildNodes(element: HTMLElement): Node[] {
    const nodes: Node[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node !== element) {
        nodes.push(node);
      }
    }

    return nodes;
  }
}
