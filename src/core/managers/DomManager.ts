

export interface IDomManager {
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
    createTextNode(content: string): Text;
    appendChild(parent: Node, child: Node): void;
    insertBefore(parent: Node, newNode: Node, referenceNode: Node | null): void;
    removeElement(element: Node): void;
    setAttribute(element: Element, name: string, value: string): void;
    setTextContent(element: Node, content: string): void;
    setStyle(element: HTMLElement, property: string, value: string): void;
    createLineBreak(): HTMLBRElement;
    createSpace(): HTMLSpanElement;
}

export class DomManager implements IDomManager {
    public createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        return document.createElement(tagName);
    }

    public createTextNode(content: string): Text {
        return document.createTextNode(content);
    }

    public appendChild(parent: Node, child: Node): void {
        parent.appendChild(child);
    }

    public insertBefore(parent: Node, newNode: Node, referenceNode: Node | null): void {
        parent.insertBefore(newNode, referenceNode);
    }

    public removeElement(element: Node): void {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    public setAttribute(element: Element, name: string, value: string): void {
        element.setAttribute(name, value);
    }

    public setTextContent(element: Node, content: string): void {
        element.textContent = content;
    }

    public setStyle(element: HTMLElement, property: string, value: string): void {
        (element.style as any)[property] = value;
    }

    public createLineBreak(): HTMLBRElement {
        return document.createElement('br');
    }

    public createSpace(): HTMLSpanElement {
        const span = document.createElement('span');
        span.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
        return span;
    }
}
