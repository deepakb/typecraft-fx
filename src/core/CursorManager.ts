import { CursorOptions, CursorStyle } from './types';

export class CursorManager {
  private cursorNode: HTMLElement;
  private options: CursorOptions;
  private rafId: number | null = null;
  private lastBlinkTime: number = 0;
  private cursorBlinkState: boolean = true;

  constructor(parentElement: HTMLElement, options: CursorOptions) {
    this.options = options;
    this.cursorNode = this.createCursorNode();
    parentElement.appendChild(this.cursorNode);
  }

  public getCursorElement(): HTMLElement {
    return this.cursorNode;
  }

  private createCursorNode(): HTMLElement {
    const cursorNode = document.createElement('span');
    cursorNode.textContent = this.options.text;
    cursorNode.style.color = this.options.color;
    cursorNode.className = `typecraft-cursor typecraft-cursor-${this.options.style}`;

    return cursorNode;
  }

  public updateCursorPosition(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    this.cursorNode.style.left = `${rect.right}px`;
    this.cursorNode.style.top = `${rect.top}px`;
  }

  public changeCursorStyle(style: CursorStyle): void {
    this.options.style = style;
    this.cursorNode.className = `typecraft-cursor typecraft-cursor-${style}`;
  }

  public startBlinking(): void {
    if (this.options.blink) {
      this.animateCursor();
    }
  }

  public stopBlinking(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public remove(): void {
    this.stopBlinking();
    if (this.cursorNode.parentNode) {
      this.cursorNode.parentNode.removeChild(this.cursorNode);
    }
  }

  private animateCursor(): void {
    const now = Date.now();
    const delta = now - (this.lastBlinkTime || 0);

    if (delta >= this.options.blinkSpeed) {
      this.cursorBlinkState = !this.cursorBlinkState;
      this.cursorNode.style.opacity = this.cursorBlinkState
        ? this.options.opacity.max.toString()
        : this.options.opacity.min.toString();
      this.lastBlinkTime = now;
    }

    this.rafId = requestAnimationFrame(() => this.animateCursor());
  }
}
