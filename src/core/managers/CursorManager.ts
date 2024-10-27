import { CursorOptions, CursorStyle } from '../../types';
import { ErrorSeverity } from '../error/TypecraftError';
import { ITypecraftLogger } from '../logging/TypecraftLogger';
import { CursorOptionsSchema } from '../../validators/TypecraftOptionsSchema';
import { ErrorHandler } from '../../utils/ErrorHandler';

export interface ICursorManager {
  getCursorElement(): HTMLElement;
  updateCursorPosition(element: HTMLElement): void;
  changeCursorStyle(style: CursorStyle): void;
  startBlinking(): void;
  stopBlinking(): void;
  updateBlink(currentTime: number): void;
  changeBlinkSpeed(speed: number): void;
  changeOpacity(opacity: { min: number; max: number }): void;
  remove(): void;
  changeCursor(cursorOptions: Partial<CursorOptions>): void;
  setupCursor(element: HTMLElement): void;
  updateCursorStyle(): void;
}

export class CursorManager implements ICursorManager {
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
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler,
    animationFrameProvider?: (callback: FrameRequestCallback) => number
  ) {
    this.validateParentElement(parentElement);
    this.options = CursorOptionsSchema.parse(options);
    this.cursorNode = this.createCursorNode();
    parentElement.appendChild(this.cursorNode);
    this.animationFrameProvider =
      animationFrameProvider || window.requestAnimationFrame.bind(window);
    this.logger.info('CursorManager initialized successfully');
  }

  public getCursorElement(): HTMLElement {
    return this.cursorNode;
  }

  public updateCursorPosition(element: HTMLElement): void {
    this.validateElement(element);
    if (this.cursorNode.parentNode) {
      this.cursorNode.parentNode.removeChild(this.cursorNode);
    }
    element.appendChild(this.cursorNode);
    this.logger.debug('Cursor position updated', { element });
  }

  public changeCursorStyle(style: CursorStyle): void {
    this.options.style = style;
    this.cursorNode.className = `typecraft-cursor typecraft-cursor-${style}`;
    this.logger.debug('Cursor style changed', { style });
  }

  public startBlinking(): void {
    if (this.options.blink && !this.isBlinking) {
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
    if (!this.isBlinking) {
      return;
    }

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
    this.logger.debug('Blink speed changed', { speed });
  }

  public changeOpacity(opacity: { min: number; max: number }): void {
    this.options.opacity = opacity;
    this.logger.debug('Opacity changed', { opacity });
  }

  public remove(): void {
    this.stopBlinking();
    if (this.cursorNode.parentNode) {
      this.cursorNode.parentNode.removeChild(this.cursorNode);
    }
  }

  public changeCursor(cursorOptions: Partial<CursorOptions>): void {
    this.validatePartialCursorOptions(cursorOptions);
    if (cursorOptions.text !== undefined) {
      this.options.text = cursorOptions.text;
      this.cursorNode.textContent = cursorOptions.text;
    }
    if (cursorOptions.color !== undefined) {
      this.options.color = cursorOptions.color;
      this.cursorNode.style.color = cursorOptions.color;
    }
    if (cursorOptions.style !== undefined) {
      this.options.style = cursorOptions.style;
      this.changeCursorStyle(cursorOptions.style);
    }
    if (cursorOptions.blink !== undefined) {
      this.options.blink = cursorOptions.blink;
      if (cursorOptions.blink) {
        this.startBlinking();
      } else {
        this.stopBlinking();
      }
    }
    if (cursorOptions.blinkSpeed !== undefined) {
      this.changeBlinkSpeed(cursorOptions.blinkSpeed);
    }
    if (cursorOptions.opacity !== undefined) {
      this.changeOpacity(cursorOptions.opacity);
    }
    this.logger.debug('Cursor options updated', { cursorOptions });
  }

  public setupCursor(element: HTMLElement): void {
    this.validateElement(element);
    this.updateCursorPosition(element);
    this.updateCursorStyle();
    if (this.options.blink) {
      this.startBlinking();
    }
    this.logger.debug('Cursor setup completed');
  }

  public updateCursorStyle(): void {
    this.cursorNode.className = `typecraft-cursor typecraft-cursor-${this.options.style}`;
    this.cursorNode.style.color = this.options.color;
    this.logger.debug('Cursor style updated');
  }

  private createCursorNode(): HTMLElement {
    const cursorNode = document.createElement('span');
    cursorNode.textContent = this.options.text;
    cursorNode.style.color = this.options.color;
    cursorNode.className = `typecraft-cursor typecraft-cursor-${this.options.style}`;
    cursorNode.style.opacity = this.options.opacity.max.toString();
    return cursorNode;
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

  private validateParentElement(element: HTMLElement): void {
    if (!(element instanceof HTMLElement)) {
      this.errorHandler.handleError(
        new Error('Invalid parent element'),
        'Invalid parent element for cursor',
        { element },
        ErrorSeverity.HIGH
      );
    }
  }

  private validateElement(element: HTMLElement): void {
    if (!(element instanceof HTMLElement)) {
      this.errorHandler.handleError(
        new Error('Invalid element'),
        'Invalid element for cursor position update',
        { element },
        ErrorSeverity.HIGH
      );
    }
  }

  private validatePartialCursorOptions(options: Partial<CursorOptions>): void {
    CursorOptionsSchema.partial().parse(options);
  }
}
