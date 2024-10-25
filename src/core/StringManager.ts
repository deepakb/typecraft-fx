import { QueueManager } from './QueueManager';
import { QueueActionType } from './types';
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { logger } from './TypecraftLogger';

export class StringManager {
  private queueManager: QueueManager;

  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
    logger.debug('StringManager initialized');
  }

  typeString(string: string, htmlEnabled: boolean): void {
    try {
      if (htmlEnabled) {
        const nodes = this.parseHTML(string);
        this.typeNodes(nodes);
      } else {
        const characters = this.parseSpecialCharacters(string);
        for (const char of characters) {
          this.queueManager.add({
            type: QueueActionType.TYPE_CHARACTER,
            payload: { char },
          });
        }
      }
      logger.debug('String queued for typing', { stringLength: string.length, htmlEnabled });
    } catch (error) {
      throw new TypecraftError(
        ErrorCode.RUNTIME_ERROR,
        'Failed to queue string for typing',
        ErrorSeverity.HIGH,
        { originalError: error, string, htmlEnabled }
      );
    }
  }

  public typeWord(word: string): void {
    try {
      this.typeString(` ${word}`, false);
      logger.debug('Word queued for typing', { word });
    } catch (error) {
      throw new TypecraftError(
        ErrorCode.RUNTIME_ERROR,
        'Failed to queue word for typing',
        ErrorSeverity.HIGH,
        { originalError: error, word }
      );
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
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Failed to parse HTML',
        ErrorSeverity.HIGH,
        { originalError: error, html }
      );
    }
  }

  private typeNodes(nodes: Node[]): void {
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        this.typeTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        this.typeElementNode(node as HTMLElement);
      }
    });
  }

  private typeTextNode(node: Node): void {
    const text = node.textContent || '';
    for (let i = 0; i < text.length; i++) {
      this.queueManager.add({
        type: QueueActionType.TYPE_CHARACTER,
        payload: { char: text[i] },
      });
    }
  }

  private typeElementNode(element: HTMLElement): void {
    this.queueManager.add({
      type: QueueActionType.TYPE_HTML_TAG_OPEN,
      payload: { tagName: element.tagName.toLowerCase(), attributes: element.attributes },
    });

    if (element.childNodes.length === 1 && element.firstChild?.nodeType === Node.TEXT_NODE) {
      this.queueManager.add({
        type: QueueActionType.TYPE_HTML_CONTENT,
        payload: { content: element.textContent || '' },
      });
    } else {
      this.typeNodes(Array.from(element.childNodes));
    }

    this.queueManager.add({
      type: QueueActionType.TYPE_HTML_TAG_CLOSE,
      payload: { tagName: element.tagName.toLowerCase() },
    });
  }

  public deleteChars(numChars: number): void {
    try {
      for (let i = 0; i < numChars; i++) {
        this.queueManager.add({ type: QueueActionType.DELETE_CHARACTERS, payload: {} });
      }
      logger.debug('Characters queued for deletion', { numChars });
    } catch (error) {
      throw new TypecraftError(
        ErrorCode.RUNTIME_ERROR,
        'Failed to queue characters for deletion',
        ErrorSeverity.HIGH,
        { originalError: error, numChars }
      );
    }
  }

  public deleteAll(visibleNodesLength: number): void {
    try {
      this.deleteChars(visibleNodesLength);
      logger.debug('All characters queued for deletion', { visibleNodesLength });
    } catch (error) {
      throw new TypecraftError(
        ErrorCode.RUNTIME_ERROR,
        'Failed to queue all characters for deletion',
        ErrorSeverity.HIGH,
        { originalError: error, visibleNodesLength }
      );
    }
  }
}
