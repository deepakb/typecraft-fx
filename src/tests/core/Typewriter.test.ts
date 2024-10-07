import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Typewriter } from './../../core/Typewriter';
import { Direction, CursorStyle, TextEffect } from './../../core/types';

describe('Typewriter', () => {
  let element: HTMLElement;
  let typewriter: Typewriter;

  beforeEach(() => {
    element = document.createElement('div');
    typewriter = new Typewriter(element);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(element);
    vi.useRealTimers();
  });

  it('should create an instance with default options', () => {
    expect(typewriter).toBeDefined();
    expect(element.querySelector('.typewriter-cursor')).toBeDefined();
  });

  it('should create an instance with custom options', () => {
    typewriter = new Typewriter(element, {
      loop: true,
      cursor: {
        text: '_',
        color: 'black',
        blinkSpeed: 530,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      cursorStyle: CursorStyle.Blink,
      direction: Direction.RTL,
    });

    expect(element.style.direction).toBe('rtl');
    const cursor = element.querySelector('.typewriter-cursor');
    expect(cursor?.textContent).toBe('_');
    expect(cursor?.classList.contains('typewriter-cursor-blink')).toBe(true);
  });

  it('should type a string', async () => {
    await typewriter.typeString('Hello').start();
    expect(element.textContent?.trim()).toBe('Hello');
  });

  it('should delete characters', async () => {
    typewriter = new Typewriter(element);
    await typewriter.typeString('Hello').deleteChars(2).start();
    vi.runAllTimers();
    expect(element.textContent?.replace(/\|$/, '')).toBe('Hel');
  });

  it('should delete all characters', async () => {
    typewriter = new Typewriter(element);
    await typewriter.typeString('Hello').deleteAll().start();
    vi.runAllTimers();
    expect(element.textContent?.replace(/\|$/, '')).toBe('');
  });

  it('should pause for specified duration', async () => {
    typewriter = new Typewriter(element);
    await typewriter.typeString('Hello').pauseFor(1000).typeString('World').start();
    vi.runAllTimers();
    expect(element.textContent?.replace(/\|$/, '')).toBe('HelloWorld');
  });

  it('should change typing speed', async () => {
    typewriter = new Typewriter(element);
    const slowStart = Date.now();
    await typewriter.changeSpeed(100).typeString('Slow').start();
    const slowDuration = Date.now() - slowStart;

    typewriter = new Typewriter(element);
    const fastStart = Date.now();
    await typewriter.changeSpeed(10).typeString('Fast').start();
    const fastDuration = Date.now() - fastStart;

    expect(slowDuration).toBeGreaterThan(fastDuration);
  });

  it('should change delete speed', async () => {
    typewriter = new Typewriter(element);
    await typewriter.typeString('ToDelete').start();

    const slowStart = Date.now();
    await typewriter.changeDeleteSpeed(100).deleteAll().start();
    const slowDuration = Date.now() - slowStart;

    await typewriter.typeString('ToDelete').start();

    const fastStart = Date.now();
    await typewriter.changeDeleteSpeed(10).deleteAll().start();
    const fastDuration = Date.now() - fastStart;

    expect(slowDuration).toBeGreaterThan(fastDuration);
  });
  it('should change text direction', () => {
    typewriter.setDirection(Direction.RTL);
    expect(element.style.direction).toBe('rtl');
    typewriter.setDirection(Direction.LTR);
    expect(element.style.direction).toBe('ltr');
  });

  it('should change cursor style', () => {
    typewriter.changeCursorStyle(CursorStyle.Smooth);
    let cursor = element.querySelector('.typewriter-cursor');
    expect(cursor?.classList.contains('typewriter-cursor-smooth')).toBe(true);

    typewriter.changeCursorStyle(CursorStyle.Blink);
    cursor = element.querySelector('.typewriter-cursor');
    expect(cursor?.classList.contains('typewriter-cursor-blink')).toBe(true);
  });

  it('should change cursor', () => {
    typewriter.changeCursor('_');
    const cursor = element.querySelector('.typewriter-cursor');
    expect(cursor?.textContent).toBe('_');
  });

  it('should apply text effect', async () => {
    typewriter = new Typewriter(element);
    await typewriter.changeTextEffect(TextEffect.FadeIn).typeString('Fade').start();
    vi.runAllTimers();
    const firstChar = element.firstChild as HTMLElement;
    expect(firstChar.style.opacity).toBe('1');
    expect(firstChar.style.transition).toContain('opacity');
  });

  it('should handle loop option', async () => {
    typewriter = new Typewriter(element, { loop: true });
    await typewriter.typeString('Loop').deleteAll().start();
    vi.runAllTimers();
    expect(element.textContent?.replace(/\|$/, '')).toBe('Loop');
  });

  it('should stop typing', async () => {
    typewriter = new Typewriter(element);
    const typingPromise = typewriter.typeString('This should not complete').start();
    vi.advanceTimersByTime(100);
    typewriter.stop();
    await typingPromise;
    expect(element.textContent?.replace(/\|$/, '').length).toBeLessThan(
      'This should not complete'.length
    );
  });

  it('should handle empty string', async () => {
    typewriter = new Typewriter(element);
    await typewriter.typeString('').start();
    vi.runAllTimers();
    expect(element.textContent?.replace(/\|$/, '')).toBe('');
  });

  it('should handle multiple operations', async () => {
    typewriter = new Typewriter(element);
    await typewriter
      .typeString('Hello')
      .pauseFor(100)
      .deleteChars(2)
      .typeString(' World')
      .changeSpeed(10)
      .deleteAll()
      .typeString('Done')
      .start();
    vi.runAllTimers();
    expect(element.textContent?.replace(/\|$/, '')).toBe('Done');
  });
});
