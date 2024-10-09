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
    new CursorManager(parentElement, defaultOptions);
    expect(parentElement.children.length).toBe(1);
    expect(parentElement.firstChild).toBeInstanceOf(HTMLSpanElement);
    expect(parentElement.firstChild?.textContent).toBe('|');
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
      text: '|',
      color: 'black',
      blinkSpeed: 530,
      opacity: { min: 0, max: 1 },
      style: CursorStyle.Solid,
      blink: true,
    });

    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    // Start blinking
    cursorManager.startBlinking();

    // Advance timers to ensure the animation frame is set
    vi.advanceTimersByTime(100);

    // Stop blinking
    cursorManager.stopBlinking();

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

  it('changeCursorText updates cursor text', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    cursorManager.changeCursorText('_');
    expect(parentElement.firstChild?.textContent).toBe('_');
  });

  it('updateCursorPosition moves cursor to end of parent element', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    const textNode = document.createTextNode('Hello');
    parentElement.insertBefore(textNode, parentElement.firstChild);

    cursorManager.updateCursorPosition(parentElement);

    expect(parentElement.lastChild).toBe(cursorManager['cursorElement']);
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
    vi.useFakeTimers();
    const cursorManager = new CursorManager(parentElement, { ...defaultOptions, blink: true });
    cursorManager.startBlinking();

    vi.advanceTimersByTime(500);
    expect((parentElement.firstChild as HTMLElement).style.opacity).toBe('0');

    vi.advanceTimersByTime(500);
    expect((parentElement.firstChild as HTMLElement).style.opacity).toBe('1');

    vi.useRealTimers();
  });
});
