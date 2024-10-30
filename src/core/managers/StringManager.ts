import { QueueManager } from './QueueManager';
import { QueueActionType } from '../../types';
import { ErrorSeverity } from '../error/TypecraftError';
import { ITypecraftLogger } from '../logging/TypecraftLogger';
import { ErrorHandler } from '../../utils/ErrorHandler';

export interface IStringManager {
  typeString(string: string, htmlEnabled: boolean): void;
  typeWord(word: string): void;
  deleteChars(numChars: number): void;
  deleteAll(visibleNodesLength: number): void;
}

export class StringManager implements IStringManager {
  constructor(
    private queueManager: QueueManager,
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler
  ) {
    this.logger.debug('StringManager initialized');
  }

  public typeString(string: string, htmlEnabled: boolean): void {
    if (typeof string !== 'string' || typeof htmlEnabled !== 'boolean') {
      this.errorHandler.handleError(
        new Error('Invalid input'),
        'Invalid input for typeString',
        { string, htmlEnabled },
        ErrorSeverity.HIGH
      );
    }

    if (htmlEnabled) {
      const nodes = this.parseHTML(string);
      this.typeNodes(nodes);
    } else {
      this.typeCharacters(string);
    }

    this.logger.debug('String queued for typing', {
      stringLength: string.length,
      htmlEnabled,
    });
  }

  public typeWord(word: string): void {
    if (typeof word !== 'string') {
      this.errorHandler.handleError(
        new Error('Invalid word'),
        'Invalid input for typeWord',
        { word },
        ErrorSeverity.HIGH
      );
    }

    this.typeString(` ${word}`, false);
    this.logger.debug('Word queued for typing', { word });
  }

  public deleteChars(numChars: number): void {
    if (typeof numChars !== 'number' || numChars < 0) {
      this.errorHandler.handleError(
        new Error('Invalid number of characters'),
        'Invalid input for deleteChars',
        { numChars },
        ErrorSeverity.HIGH
      );
    }

    for (let i = 0; i < numChars; i++) {
      this.queueManager.add({ type: QueueActionType.DELETE_CHARACTERS, payload: {} });
    }
    this.logger.debug('Characters queued for deletion', { numChars });
  }

  public deleteAll(visibleNodesLength: number): void {
    if (typeof visibleNodesLength !== 'number' || visibleNodesLength < 0) {
      this.errorHandler.handleError(
        new Error('Invalid visible nodes length'),
        'Invalid input for deleteAll',
        { visibleNodesLength },
        ErrorSeverity.HIGH
      );
    }

    this.deleteChars(visibleNodesLength);
    this.logger.debug('All characters queued for deletion', { visibleNodesLength });
  }

  private typeCharacters(string: string): void {
    const characters = this.parseSpecialCharacters(string);
    for (const char of characters) {
      this.queueManager.add({
        type: QueueActionType.TYPE_CHARACTER,
        payload: { char },
      });
    }
  }

  private parseSpecialCharacters(string: string): string[] {
    return string.split('').map((char) => {
      if (char === '\n') {
        return '\n';
      }
      if (char === '\t') {
        return '\t';
      }
      return char;
    });
  }

  private parseHTML(html: string): Node[] {
    try {
      const template = document.createElement('template');
      template.innerHTML = html;
      return Array.from(template.content.childNodes);
    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to parse HTML', { html }, ErrorSeverity.HIGH);
    }
  }

  private typeNodes(nodes: Node[]): void {
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        this.queueManager.add({
          type: QueueActionType.TYPE_HTML_TAG_OPEN,
          payload: { tagName: element.tagName, attributes: element.attributes },
        });

        // Process child nodes
        if (element.childNodes.length > 0) {
          Array.from(element.childNodes).forEach((childNode) => {
            if (childNode.nodeType === Node.TEXT_NODE) {
              // Use TYPE_HTML_CONTENT for text inside HTML elements
              this.queueManager.add({
                type: QueueActionType.TYPE_HTML_CONTENT,
                payload: { content: childNode.textContent || '' },
              });
            } else if (childNode.nodeType === Node.ELEMENT_NODE) {
              this.typeNodes([childNode]);
            }
          });
        }

        this.queueManager.add({
          type: QueueActionType.TYPE_HTML_TAG_CLOSE,
          payload: { tagName: element.tagName },
        });
      } else if (node.nodeType === Node.TEXT_NODE) {
        // Use TYPE_CHARACTER for root-level text nodes
        const text = node.textContent || '';
        for (const char of text) {
          this.queueManager.add({
            type: QueueActionType.TYPE_CHARACTER,
            payload: { char },
          });
        }
      }
    });
  }
}
