import { CursorManager } from '../../src/core/CursorManager';
import { CursorOptions, CursorStyle } from '../../src/core/types';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('CursorManager', () => {
  let parentElement: HTMLElement;
  let defaultOptions: CursorOptions;

  beforeEach(() => {
    parentElement = document.createElement('div');
    defaultOptions = {
      text: '|',
      opacity: { min: 0, max: 1 },
      color: 'black',
      blinkSpeed: 500,
      style: CursorStyle.Solid,
      blink: false,
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('constructor creates and appends cursor element', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
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
    });

    const animateCursorSpy = vi.spyOn(cursorManager as any, 'animateCursor');

    cursorManager.startBlinking();

    expect(animateCursorSpy).toHaveBeenCalledTimes(1);

    // Clean up the spy
    animateCursorSpy.mockRestore();
  });

  it('startBlinking does not start animation for non-blink option', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    const animateCursorSpy = vi.spyOn(cursorManager as any, 'animateCursor');

    cursorManager.startBlinking();
    expect(animateCursorSpy).not.toHaveBeenCalled();
  });

  it('stopBlinking cancels animation frame', () => {
    const parentElement = document.createElement('div');
    const cursorManager = new CursorManager(parentElement, {
      ...defaultOptions,
      blink: true,
    });

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
    const cursorManager = new CursorManager(parentElement, defaultOptions);

    cursorManager.changeCursorStyle(CursorStyle.Blink);

    expect((parentElement.firstChild as Element).className).toBe(
      'typecraft-cursor typecraft-cursor-blink'
    );
  });

  it('updateCursorPosition updates cursor position', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    const targetElement = document.createElement('div');
    Object.defineProperty(targetElement, 'getBoundingClientRect', {
      value: () => ({ top: 10, right: 20 }),
    });

    cursorManager.updateCursorPosition(targetElement);

    const cursorElement = cursorManager.getCursorElement();
    expect(cursorElement.style.left).toBe('20px');
    expect(cursorElement.style.top).toBe('10px');
  });

  it('remove stops blinking and removes cursor element', () => {
    const blinkOptions = { ...defaultOptions, blink: true };
    const cursorManager = new CursorManager(parentElement, blinkOptions);
    const stopBlinkingSpy = vi.spyOn(cursorManager, 'stopBlinking');

    cursorManager.remove();

    expect(stopBlinkingSpy).toHaveBeenCalledTimes(1);
    expect(parentElement.children.length).toBe(0);
  });

  it('animateCursor changes opacity based on blink state', () => {
    const parentElement = document.createElement('div');
    const options: CursorOptions = {
      text: '|',
      color: 'black',
      style: CursorStyle.Solid,
      blink: true,
      blinkSpeed: 500,
      opacity: { min: 0, max: 1 },
    };

    const cursorManager = new CursorManager(parentElement, options);
    const cursorElement = cursorManager.getCursorElement();

    // Initial state
    expect(cursorElement.style.opacity).toBe('1');

    // Reset lastBlinkTime to ensure correct initial state
    cursorManager.resetLastBlinkTime();

    // Advance time by full blinkSpeed
    cursorManager.forceAnimationFrame(500);
    expect(cursorElement.style.opacity).toBe('0');

    // Advance time by another full blinkSpeed
    cursorManager.forceAnimationFrame(1000);
    expect(cursorElement.style.opacity).toBe('1');
  });

  it('animateCursor changes opacity based on blink state and respects blinkSpeed', () => {
    const parentElement = document.createElement('div');
    const blinkSpeed = 500;
    const options: CursorOptions = {
      text: '|',
      color: 'black',
      style: CursorStyle.Solid,
      blink: true,
      blinkSpeed,
      opacity: { min: 0, max: 1 },
    };

    const cursorManager = new CursorManager(parentElement, options);
    const cursorElement = cursorManager.getCursorElement();

    // Initial state
    expect(cursorElement.style.opacity).toBe('1');

    // Reset lastBlinkTime to ensure correct initial state
    cursorManager.resetLastBlinkTime();

    // Advance time to just before blinkSpeed (should not change)
    cursorManager.forceAnimationFrame(blinkSpeed - 1);
    expect(cursorElement.style.opacity).toBe('1');

    // Advance time to full blinkSpeed (should change)
    cursorManager.forceAnimationFrame(blinkSpeed);
    expect(cursorElement.style.opacity).toBe('0');

    // Advance time by full blinkSpeed again (should change back)
    cursorManager.forceAnimationFrame(blinkSpeed * 2);
    expect(cursorElement.style.opacity).toBe('1');
  });

  it('updateCursorPosition updates cursor position', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    const targetElement = document.createElement('div');
    Object.defineProperty(targetElement, 'getBoundingClientRect', {
      value: () => ({ top: 10, right: 20 }),
    });

    cursorManager.updateCursorPosition(targetElement);

    const cursorElement = cursorManager.getCursorElement();
    expect(cursorElement.style.left).toBe('20px');
    expect(cursorElement.style.top).toBe('10px');
  });

  it('getCursorElement returns the cursor element', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    const cursorElement = cursorManager.getCursorElement();
    expect(cursorElement).toBeInstanceOf(HTMLSpanElement);
    expect(cursorElement.className).toContain('typecraft-cursor');
  });

  it('remove stops blinking and removes cursor element when parent exists', () => {
    const blinkOptions = { ...defaultOptions, blink: true };
    const cursorManager = new CursorManager(parentElement, blinkOptions);
    const stopBlinkingSpy = vi.spyOn(cursorManager, 'stopBlinking');

    cursorManager.remove();

    expect(stopBlinkingSpy).toHaveBeenCalledTimes(1);
    expect(parentElement.children.length).toBe(0);
  });

  it('remove handles case when cursor element has no parent', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    parentElement.removeChild(cursorManager.getCursorElement());

    expect(() => cursorManager.remove()).not.toThrow();
  });
});
