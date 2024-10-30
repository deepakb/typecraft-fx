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
  reset(parentElement: HTMLElement, options: CursorOptions): void;
  changeCursor(cursorOptions: Partial<CursorOptions>): void;
  setupCursor(element: HTMLElement): void;
  updateCursorStyle(): void;
}

export class CursorManager implements ICursorManager {
  private cursorNode!: HTMLElement;
  private options!: CursorOptions;
  private rafId: number | null = null;
  private lastBlinkTime: number = 0;
  private cursorBlinkState: boolean = true;
  private isBlinking: boolean = false;
  private blinkInterval: number = 530;
  private animationFrameProvider: (callback: FrameRequestCallback) => number;
  private isVisible: boolean = false;

  constructor(
    parentElement: HTMLElement,
    options: CursorOptions,
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler,
    animationFrameProvider?: (callback: FrameRequestCallback) => number
  ) {
    this.animationFrameProvider =
      animationFrameProvider || window.requestAnimationFrame.bind(window);
    this.initialize(parentElement, options, animationFrameProvider);
    this.hideCursor();
  }

  private initialize(
    parentElement: HTMLElement,
    options: CursorOptions,
    animationFrameProvider?: (callback: FrameRequestCallback) => number
  ): void {
    this.validateParentElement(parentElement);
    this.options = CursorOptionsSchema.parse(options);
    this.cursorNode = this.createCursorNode();
    parentElement.appendChild(this.cursorNode);
    this.animationFrameProvider =
      animationFrameProvider || window.requestAnimationFrame.bind(window);
    this.setupCursor(parentElement);
    this.logger.info('CursorManager initialized successfully');
  }

  public getCursorElement(): HTMLElement {
    return this.cursorNode;
  }

  public updateCursorPosition(element: HTMLElement): void {
    this.validateElement(element);

    // Remove any existing cursor
    if (this.cursorNode.parentNode) {
      this.cursorNode.parentNode.removeChild(this.cursorNode);
    }

    // Simply append the cursor at the end of the content
    element.appendChild(this.cursorNode);

    // Show the cursor if it's supposed to be visible
    if (this.isVisible) {
      this.showCursor();
    }

    this.logger.debug('Cursor position updated', { element });
  }

  public changeCursorStyle(style: CursorStyle): void {
    this.options.style = style;
    this.cursorNode.className = `typecraft-cursor typecraft-cursor-${style}`;
    this.logger.debug('Cursor style changed', { style });
  }

  startBlinking(): void {
    if (this.isBlinking) {
      return;
    }

    this.isBlinking = true;
    this.lastBlinkTime = performance.now();
    this.cursorBlinkState = true;
    this.updateCursorVisibility();
    this.animateCursor();
  }

  stopBlinking(): void {
    this.isBlinking = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.cursorBlinkState = true;
    this.updateCursorVisibility();
  }

  updateBlink(currentTime: number): void {
    if (!this.isBlinking) {
      return;
    }

    if (currentTime - this.lastBlinkTime >= this.blinkInterval) {
      this.cursorBlinkState = !this.cursorBlinkState;
      this.updateCursorVisibility();
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
    if (this.cursorNode && this.cursorNode.parentNode) {
      this.cursorNode.parentNode.removeChild(this.cursorNode);
    }
    this.logger.info('Cursor removed');
  }

  public reset(parentElement: HTMLElement, options: CursorOptions): void {
    this.remove();
    this.initialize(parentElement, options, this.animationFrameProvider);
    this.logger.info('CursorManager reset successfully');
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
    this.cursorNode.style.opacity = this.options.opacity.max.toString();
    if (this.options.blink) {
      this.startBlinking();
    }

    this.logger.debug('Cursor setup completed', { blinkEnabled: this.options.blink });
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
    cursorNode.style.display = 'inline-block';
    return cursorNode;
  }

  private animateCursor = (): void => {
    if (!this.isBlinking) {
      return;
    }

    const currentTime = performance.now();
    if (currentTime - this.lastBlinkTime >= this.blinkInterval) {
      this.cursorBlinkState = !this.cursorBlinkState;
      this.updateCursorVisibility();
      this.lastBlinkTime = currentTime;
    }

    this.rafId = this.animationFrameProvider(this.animateCursor);
  };

  private updateCursorVisibility(): void {
    if (this.cursorNode) {
      this.cursorNode.style.visibility = this.cursorBlinkState ? 'visible' : 'hidden';
    }
  }

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

  private hideCursor(): void {
    if (this.cursorNode) {
      this.cursorNode.style.visibility = 'hidden';
      this.isVisible = false;
    }
  }

  private showCursor(): void {
    if (this.cursorNode) {
      this.cursorNode.style.visibility = 'visible';
      this.isVisible = true;
    }
  }
}
