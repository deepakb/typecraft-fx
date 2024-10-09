import { CursorOptions, CursorStyle } from './types';

export class CursorManager {
  private cursorElement: HTMLElement;
  private options: CursorOptions;
  private blinkInterval: number | null = null;
  private cursorBlinkState: boolean = true;
  private lastCursorBlinkTime: number = 0;

  constructor(parentElement: HTMLElement, options: CursorOptions) {
    this.options = options;
    this.cursorElement = this.createCursorElement();
    parentElement.appendChild(this.cursorElement);
    // this.startBlinking();
    this.cursorBlinkState = true;
    this.lastCursorBlinkTime = Date.now();
    this.blinkInterval = null;
  }

  private createCursorElement(): HTMLElement {
    const cursor = document.createElement('span');
    cursor.textContent = this.options.text;
    cursor.style.color = this.options.color;
    cursor.style.opacity = this.options.opacity.max.toString();
    cursor.className = `typecraft-cursor typecraft-cursor-${this.options.style}`;
    return cursor;
  }

  public startBlinking(): void {
    if (this.options.blink && this.blinkInterval === null) {
      this.animateCursor();
    }
  }

  public stopBlinking(): void {
    if (this.blinkInterval !== null) {
      cancelAnimationFrame(this.blinkInterval);
      this.blinkInterval = null;
    }
  }

  public changeCursorStyle(style: CursorStyle): void {
    this.options.style = style;
    this.cursorElement.className = `typecraft-cursor typecraft-cursor-${style}`;
  }

  public changeCursorText(text: string): void {
    this.options.text = text;
    this.cursorElement.textContent = text;
  }

  public updateCursorPosition(parentElement: HTMLElement): void {
    parentElement.appendChild(this.cursorElement);
  }

  public remove(): void {
    this.stopBlinking();
    this.cursorElement.remove();
  }

  public removeCursor(): void {
    if (this.cursorElement && this.cursorElement.parentNode) {
      this.cursorElement.parentNode.removeChild(this.cursorElement);
    }
  }

  public getCursorElement(): HTMLElement {
    return this.cursorElement;
  }

  private animateCursor(): void {
    const now = Date.now();
    const delta = now - this.lastCursorBlinkTime;

    if (delta >= this.options.blinkSpeed) {
      this.cursorBlinkState = !this.cursorBlinkState;
      this.cursorElement.style.opacity = this.cursorBlinkState
        ? this.options.opacity.max.toString()
        : this.options.opacity.min.toString();
      this.lastCursorBlinkTime = now;
    }

    if (this.options.blink) {
      this.blinkInterval = requestAnimationFrame(() => this.animateCursor());
    }
  }
}
