import { CursorManager } from './../../core/CursorManager';
import { CursorOptions, CursorStyle } from './../../core/types';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('CursorManager', () => {
  let parentElement: HTMLElement;
  let defaultOptions: CursorOptions;

  beforeEach(() => {
    parentElement = document.createElement('div');
    defaultOptions = {
      cursorStyle: CursorStyle.Solid,
      text: '|',
      opacity: { min: 0, max: 1 },
      color: 'black',
      blinkSpeed: 500,
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

  it('startBlinking sets interval for blink style', () => {
    const blinkOptions = { ...defaultOptions, cursorStyle: CursorStyle.Blink };
    new CursorManager(parentElement, blinkOptions);

    vi.advanceTimersByTime(500);
    expect((parentElement.firstChild as HTMLElement).style.opacity).toBe('0');

    vi.advanceTimersByTime(500);
    expect((parentElement.firstChild as HTMLElement).style.opacity).toBe('1');
  });

  it('startBlinking does not set interval for solid style', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    cursorManager.startBlinking();
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('stopBlinking clears interval', () => {
    const blinkOptions = { ...defaultOptions, cursorStyle: CursorStyle.Blink };
    const cursorManager = new CursorManager(parentElement, blinkOptions);

    cursorManager.stopBlinking();
    vi.advanceTimersByTime(1000);
    expect((parentElement.firstChild as HTMLElement).style.opacity).toBe('');
  });

  it('changeCursorStyle updates class and restarts blinking', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    const stopBlinkingSpy = vi.spyOn(cursorManager, 'stopBlinking');
    const startBlinkingSpy = vi.spyOn(cursorManager, 'startBlinking');

    cursorManager.changeCursorStyle(CursorStyle.Blink);

    expect((parentElement.firstChild as Element).className).toBe(
      'typewriter-cursor typewriter-cursor-blink'
    );
    expect(stopBlinkingSpy).toHaveBeenCalledTimes(1);
    expect(startBlinkingSpy).toHaveBeenCalledTimes(1);
  });

  it('changeCursorText updates cursor text', () => {
    const cursorManager = new CursorManager(parentElement, defaultOptions);
    cursorManager.changeCursorText('_');
    expect(parentElement.firstChild?.textContent).toBe('_');
  });

  it('remove stops blinking and removes cursor element', () => {
    const blinkOptions = { ...defaultOptions, cursorStyle: CursorStyle.Blink };
    const cursorManager = new CursorManager(parentElement, blinkOptions);
    const stopBlinkingSpy = vi.spyOn(cursorManager, 'stopBlinking');

    cursorManager.remove();

    expect(stopBlinkingSpy).toHaveBeenCalledTimes(1);
    expect(parentElement.children.length).toBe(0);
  });
});
