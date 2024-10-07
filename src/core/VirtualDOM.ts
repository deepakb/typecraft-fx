export interface VNode {
  type: 'text' | 'element';
  content?: string;
  tag?: string;
  attributes?: { [key: string]: string };
  children?: VNode[];
}

export class VirtualDOM {
  private vdom: VNode[] = [];

  public updateDOM(element: HTMLElement): void {
    const fragment = document.createDocumentFragment();
    this.vdom.forEach((vnode) => {
      fragment.appendChild(this.createRealNode(vnode));
    });
    element.innerHTML = '';
    element.appendChild(fragment);
  }

  public addNode(node: VNode): void {
    this.vdom.push(node);
  }

  public removeLastNode(): void {
    if (this.vdom.length > 0) {
      this.vdom.pop();
    }
  }

  public clear(): void {
    this.vdom = [];
  }

  private createRealNode(vnode: VNode): Node {
    if (vnode.type === 'text') {
      return document.createTextNode(vnode.content || '');
    } else {
      const element = document.createElement(vnode.tag || 'span');
      if (vnode.children) {
        vnode.children.forEach((child) => {
          element.appendChild(this.createRealNode(child));
        });
      }
      return element;
    }
  }
}
