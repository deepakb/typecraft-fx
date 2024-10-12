import { CursorOptions, CursorStyle } from './types';

export class CursorManager {
  private cursorNode: HTMLElement;
  private options: CursorOptions;
  private rafId: number | null = null;
  private lastBlinkTime: number = 0;
  private cursorBlinkState: boolean = true;
  private isBlinking: boolean = false;
  private animationFrameProvider: (callback: FrameRequestCallback) => number;

  constructor(
    parentElement: HTMLElement,
    options: CursorOptions,
    animationFrameProvider?: (callback: FrameRequestCallback) => number
  ) {
    this.options = options;
    this.cursorNode = this.createCursorNode();
    parentElement.appendChild(this.cursorNode);
    this.animationFrameProvider =
      animationFrameProvider || window.requestAnimationFrame.bind(window);
  }

  public getCursorElement(): HTMLElement {
    return this.cursorNode;
  }

  private createCursorNode(): HTMLElement {
    const cursorNode = document.createElement('span');
    cursorNode.textContent = this.options.text;
    cursorNode.style.color = this.options.color;
    cursorNode.className = `typecraft-cursor typecraft-cursor-${this.options.style}`;
    cursorNode.style.opacity = this.options.opacity.max.toString();
    return cursorNode;
  }

  public updateCursorPosition(element: HTMLElement): void {
    if (this.cursorNode.parentNode) {
      this.cursorNode.parentNode.removeChild(this.cursorNode);
    }
    element.appendChild(this.cursorNode);
  }

  public changeCursorStyle(style: CursorStyle): void {
    this.options.style = style;
    this.cursorNode.className = `typecraft-cursor typecraft-cursor-${style}`;
  }

  public startBlinking(): void {
    if (this.options.blink) {
      this.stopBlinking();
      this.isBlinking = true;
      this.lastBlinkTime = performance.now();
      this.cursorBlinkState = true;
      this.cursorNode.style.opacity = this.options.opacity.max.toString();
      this.animateCursor();
    }
  }

  public stopBlinking(): void {
    this.isBlinking = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public updateBlink(currentTime: number): void {
    const delta = currentTime - this.lastBlinkTime;
    if (delta >= this.options.blinkSpeed) {
      this.cursorBlinkState = !this.cursorBlinkState;
      this.cursorNode.style.opacity = this.cursorBlinkState
        ? this.options.opacity.max.toString()
        : this.options.opacity.min.toString();
      this.lastBlinkTime = currentTime;
    }
  }

  public changeBlinkSpeed(speed: number): void {
    this.options.blinkSpeed = speed;
  }

  public changeOpacity(opacity: { min: number; max: number }): void {
    this.options.opacity = opacity;
  }

  public remove(): void {
    this.stopBlinking();
    if (this.cursorNode.parentNode) {
      this.cursorNode.parentNode.removeChild(this.cursorNode);
    }
  }

  private animateCursor = (): void => {
    const now = performance.now();
    const timeSinceLastBlink = now - this.lastBlinkTime;

    if (timeSinceLastBlink >= this.options.blinkSpeed) {
      this.cursorBlinkState = !this.cursorBlinkState;
      this.lastBlinkTime = now;
      this.cursorNode.style.opacity = this.cursorBlinkState
        ? this.options.opacity.max.toString()
        : this.options.opacity.min.toString();
    }

    if (this.isBlinking) {
      this.rafId = this.animationFrameProvider(this.animateCursor);
    }
  };
}
