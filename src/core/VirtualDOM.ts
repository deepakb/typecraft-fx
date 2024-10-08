export interface VNode {
  type: 'element' | 'text';
  tag?: string;
  attributes?: { [key: string]: string };
  content?: string;
  children?: VNode[];
}

export class VirtualDOM {
  public root: VNode;

  constructor() {
    this.root = { type: 'element', tag: 'div', children: [] };
  }

  public addNode(node: VNode): void {
    if (!this.root.children) {
      this.root.children = [];
    }
    this.root.children.push(node);
  }

  public removeLastNode(): void {
    if (this.root.children && this.root.children.length > 0) {
      this.root.children.pop();
    }
  }

  public updateDOM(container: HTMLElement): void {
    this.reconcile(container, this.root);
  }

  private reconcile(parentElement: HTMLElement, vNode: VNode): void {
    // Remove all existing children
    while (parentElement.firstChild) {
      parentElement.removeChild(parentElement.firstChild);
    }

    // Create and append new children based on the virtual DOM
    if (vNode.children) {
      vNode.children.forEach((child) => this.createDOMNode(child, parentElement));
    }
  }

  private createDOMNode(vNode: VNode, parentElement: HTMLElement): void {
    if (vNode.type === 'text') {
      const textNode = document.createTextNode(vNode.content || '');
      parentElement.appendChild(textNode);
    } else if (vNode.type === 'element') {
      const element = document.createElement(vNode.tag || 'div');

      // Set attributes
      if (vNode.attributes) {
        Object.entries(vNode.attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }

      // Recursively create child nodes
      if (vNode.children) {
        vNode.children.forEach((childNode) => {
          this.createDOMNode(childNode, element);
        });
      }

      parentElement.appendChild(element);
    }
  }

  public getHTML(): string {
    const tempContainer = document.createElement('div');
    if (this.root.children) {
      this.root.children.forEach((child) => this.createDOMNode(child, tempContainer));
    }
    return tempContainer.innerHTML;
  }
}
