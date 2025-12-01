import { CursorManager } from '../../src/core/managers/CursorManager';
import { CursorOptions, CursorStyle } from '../../src/types';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('CursorManager', () => {
  let parentElement: HTMLElement;
  let defaultOptions: CursorOptions;
  let now: number;
  let animationFrameCallback: FrameRequestCallback | null;
  let mockLogger: any;
  let mockErrorHandler: any;

  const customRequestAnimationFrame = (callback: FrameRequestCallback): number => {
    animationFrameCallback = callback;
    return 0;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    animationFrameCallback = null;

    parentElement = document.createElement('div');
    defaultOptions = {
      text: '|',
      color: 'black',
      blinkSpeed: 530,
      opacity: { min: 0, max: 1 },
      style: CursorStyle.Solid,
      blink: true,
    };

    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    mockErrorHandler = {
      handleError: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('constructor creates and appends cursor element', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions, mockLogger, mockErrorHandler);
    expect(parentElement.children.length).toBe(1);
    const cursorElement = cursorManager.getCursorElement();
    expect(cursorElement).toBeInstanceOf(HTMLSpanElement);
    expect(cursorElement.textContent).toBe('|');
    expect(cursorElement.style.color).toBe('black');
    expect(cursorElement.className).toBe('typecraft-cursor typecraft-cursor-solid');
  });

  it('startBlinking starts animation for blink option', () => {
    const parentElement = document.createElement('div');
    const cursorManager = new CursorManager(parentElement, {
      text: '|',
      color: 'black',
      blinkSpeed: 530,
      opacity: { min: 0, max: 1 },
      style: CursorStyle.Solid,
      blink: true,
    }, mockLogger, mockErrorHandler);

    const animateCursorSpy = vi.spyOn(cursorManager as any, 'animateCursor');

    cursorManager.startBlinking();

    expect(animateCursorSpy).toHaveBeenCalledTimes(1);

    // Clean up the spy
    animateCursorSpy.mockRestore();
  });

  it('startBlinking does not start animation for non-blink option', () => {
    const nonBlinkOptions = { ...defaultOptions, blink: false };
    const cursorManager = new CursorManager(parentElement, nonBlinkOptions, mockLogger, mockErrorHandler);
    const animateCursorSpy = vi.spyOn(cursorManager as any, 'animateCursor');

    cursorManager.startBlinking();
    expect(animateCursorSpy).not.toHaveBeenCalled();
  });

  it('stopBlinking cancels animation frame', () => {
    const parentElement = document.createElement('div');
    const cursorManager = new CursorManager(parentElement, {
      ...defaultOptions,
      blink: true,
    }, mockLogger, mockErrorHandler);

    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    // Start blinking
    cursorManager.startBlinking();

    // Advance timers to ensure the animation frame is set
    vi.advanceTimersByTime(1000);

    // Stop blinking
    cursorManager.stopBlinking();

    // Add a small delay to allow for the next animation frame
    vi.advanceTimersByTime(16);

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();

    // Clean up the spy
    cancelAnimationFrameSpy.mockRestore();
  });

  it('changeCursorStyle updates class', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions, mockLogger, mockErrorHandler);

    cursorManager.changeCursorStyle(CursorStyle.Blink);

    expect((parentElement.firstChild as Element).className).toBe(
      'typecraft-cursor typecraft-cursor-blink'
    );
  });

  it('updateCursorPosition updates cursor position', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions, mockLogger, mockErrorHandler);
    const targetElement = document.createElement('div');

    cursorManager.updateCursorPosition(targetElement);

    const cursorElement = cursorManager.getCursorElement();
    expect(targetElement.contains(cursorElement)).toBe(true);
  });

  it('remove stops blinking and removes cursor element', () => {
    const blinkOptions = { ...defaultOptions, blink: true };
    const cursorManager = new CursorManager(parentElement, blinkOptions, mockLogger, mockErrorHandler);
    const stopBlinkingSpy = vi.spyOn(cursorManager, 'stopBlinking');

    cursorManager.remove();

    expect(stopBlinkingSpy).toHaveBeenCalledTimes(1);
    expect(parentElement.children.length).toBe(0);
  });

  it('animateCursor changes opacity based on blink state', () => {
    const cursorManager = new CursorManager(
      parentElement,
      defaultOptions,
      mockLogger,
      mockErrorHandler,
      customRequestAnimationFrame
    );
    const cursorElement = cursorManager.getCursorElement();

    cursorManager.startBlinking();

    // Initial state
    expect(cursorElement.style.opacity).toBe('1');

    // Advance time to just after blinkSpeed
    now += defaultOptions.blinkSpeed + 1;
    animationFrameCallback?.(now);

    // Opacity should have changed to 0
    expect(cursorElement.style.opacity).toBe('0');

    // Advance time again
    now += defaultOptions.blinkSpeed + 1;
    animationFrameCallback?.(now);

    // Opacity should have changed back to 1
    expect(cursorElement.style.opacity).toBe('1');

    cursorManager.stopBlinking();
  });

  it('animateCursor changes opacity based on blink state and respects blinkSpeed', () => {
    const cursorManager = new CursorManager(
      parentElement,
      defaultOptions,
      mockLogger,
      mockErrorHandler,
      customRequestAnimationFrame
    );
    const cursorElement = cursorManager.getCursorElement();

    cursorManager.startBlinking();

    // Check initial state
    expect(cursorElement.style.opacity).toBe('1');

    // Advance time to just before blinkSpeed
    now += defaultOptions.blinkSpeed - 1;
    animationFrameCallback?.(now);
    expect(cursorElement.style.opacity).toBe('1');

    // Advance time to just after blinkSpeed
    now += 2;
    animationFrameCallback?.(now);
    expect(cursorElement.style.opacity).toBe('0');

    cursorManager.stopBlinking();
  });

  it('getCursorElement returns the cursor element', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions, mockLogger, mockErrorHandler);
    const cursorElement = cursorManager.getCursorElement();
    expect(cursorElement).toBeInstanceOf(HTMLSpanElement);
    expect(cursorElement.className).toContain('typecraft-cursor');
  });

  it('remove stops blinking and removes cursor element when parent exists', () => {
    const blinkOptions = { ...defaultOptions, blink: true };
    const cursorManager = new CursorManager(parentElement, blinkOptions, mockLogger, mockErrorHandler);
    const stopBlinkingSpy = vi.spyOn(cursorManager, 'stopBlinking');

    cursorManager.remove();

    expect(stopBlinkingSpy).toHaveBeenCalledTimes(1);
    expect(parentElement.children.length).toBe(0);
  });

  it('remove handles case when cursor element has no parent', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions, mockLogger, mockErrorHandler);
    parentElement.removeChild(cursorManager.getCursorElement());

    expect(() => cursorManager.remove()).not.toThrow();
  });
});
