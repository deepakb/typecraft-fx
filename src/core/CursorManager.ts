import { CursorOptions, CursorStyle } from './types';

export class CursorManager {
  private cursorNode: HTMLElement;
  private options: CursorOptions;
  private blinkInterval: number | null = null;

  constructor(parentElement: HTMLElement, options: CursorOptions) {
    this.options = options;
    this.cursorNode = this.createCursorElement();
    parentElement.appendChild(this.cursorNode);
    this.startBlinking();
  }

  private createCursorElement(): HTMLElement {
    const cursor = document.createElement('span');
    cursor.className = `typecraft-cursor typecraft-cursor-${this.options.cursorStyle}`;
    cursor.textContent = this.options.text;
    cursor.style.color = this.options.color;
    return cursor;
  }

  public startBlinking(): void {
    if (this.options.cursorStyle === CursorStyle.Blink) {
      this.blinkInterval = window.setInterval(() => {
        this.cursorNode.style.opacity = this.cursorNode.style.opacity === '0' ? '1' : '0';
      }, this.options.blinkSpeed);
    }
  }

  public stopBlinking(): void {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
  }

  public changeCursorStyle(style: CursorStyle): void {
    this.options.cursorStyle = style;
    this.cursorNode.className = `typecraft-cursor typecraft-cursor-${style}`;
    this.stopBlinking();
    this.startBlinking();
  }

  public changeCursorText(text: string): void {
    this.options.text = text;
    this.cursorNode.textContent = text;
  }

  public remove(): void {
    this.stopBlinking();
    this.cursorNode.remove();
  }
}
