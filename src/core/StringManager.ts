import { QueueManager } from './QueueManager';
import { QueueActionType } from './types';

export class StringManager {
  private queueManager: QueueManager;

  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
  }

  typeString(string: string, htmlEnabled: boolean): void {
    if (htmlEnabled) {
      const nodes = this.parseHTML(string);
      this.typeNodes(nodes);
    } else {
      for (let i = 0; i < string.length; i++) {
        this.queueManager.add({
          type: QueueActionType.TYPE_CHARACTER,
          payload: { char: string[i] },
        });
      }
    }
  }

  private parseHTML(html: string): Node[] {
    const template = document.createElement('template');
    template.innerHTML = html;
    return Array.from(template.content.childNodes);
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
    for (let i = 0; i < numChars; i++) {
      this.queueManager.add({ type: QueueActionType.DELETE_CHARACTER, payload: {} });
    }
  }

  public deleteAll(visibleNodesLength: number): void {
    this.deleteChars(visibleNodesLength);
  }
}
