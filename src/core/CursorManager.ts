import { CursorOptions, CursorStyle } from './types';
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { logger } from './TypecraftLogger';

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
    if (!(parentElement instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_ELEMENT,
        'Invalid parent element for cursor',
        ErrorSeverity.HIGH,
        {
          parentElement,
        }
      );
    }
    this.options = this.validateOptions(options);
    this.cursorNode = this.createCursorNode();
    parentElement.appendChild(this.cursorNode);
    this.animationFrameProvider =
      animationFrameProvider || window.requestAnimationFrame.bind(window);
    logger.info('CursorManager initialized successfully');
  }

  private validateOptions(options: CursorOptions): CursorOptions {
    if (!options || typeof options !== 'object') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid cursor options',
        ErrorSeverity.HIGH,
        { options }
      );
    }
    if (options.blinkSpeed && options.blinkSpeed <= 0) {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Cursor blink speed must be greater than 0',
        ErrorSeverity.HIGH,
        { blinkSpeed: options.blinkSpeed }
      );
    }
    // Add more validations as needed
    logger.debug('Cursor options validated successfully', { options });
    return options;
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
    if (!(element instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_ELEMENT,
        'Invalid element for cursor position update',
        ErrorSeverity.HIGH,
        { element }
      );
    }
    if (this.cursorNode.parentNode) {
      this.cursorNode.parentNode.removeChild(this.cursorNode);
    }
    element.appendChild(this.cursorNode);
    logger.debug('Cursor position updated', { element });
  }

  public changeCursorStyle(style: CursorStyle): void {
    if (!Object.values(CursorStyle).includes(style)) {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid cursor style',
        ErrorSeverity.HIGH,
        { style }
      );
    }
    this.options.style = style;
    this.cursorNode.className = `typecraft-cursor typecraft-cursor-${style}`;
    logger.debug('Cursor style changed', { style });
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
    if (speed <= 0) {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Blink speed must be greater than 0',
        ErrorSeverity.HIGH,
        {
          speed,
        }
      );
    }
    this.options.blinkSpeed = speed;
    logger.debug('Blink speed changed', { speed });
  }

  public changeOpacity(opacity: { min: number; max: number }): void {
    if (
      typeof opacity.min !== 'number' ||
      typeof opacity.max !== 'number' ||
      opacity.min < 0 ||
      opacity.min > 1 ||
      opacity.max < 0 ||
      opacity.max > 1 ||
      opacity.min > opacity.max
    ) {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid opacity values',
        ErrorSeverity.HIGH,
        { opacity }
      );
    }
    this.options.opacity = opacity;
    logger.debug('Opacity changed', { opacity });
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
