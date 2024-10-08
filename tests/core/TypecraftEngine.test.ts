import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TypecraftEngine } from '../../src/core/TypecraftEngine';
import { Direction, CursorStyle, TextEffect, TypecraftOptions } from '../../src/core/types';

describe('TypecraftEngine', () => {
  let container: HTMLElement;
  let engine: TypecraftEngine;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create an instance with default options', () => {
    engine = new TypecraftEngine(container);
    expect(engine).toBeInstanceOf(TypecraftEngine);
  });

  it('should create an instance with custom options', () => {
    const options: Partial<TypecraftOptions> = {
      strings: ['Custom string'],
      speed: { type: 100, delete: 50, delay: 2000 },
      direction: Direction.RTL,
      cursor: {
        text: '_',
        color: 'red',
        opacity: { min: 0.2, max: 0.8 },
        cursorStyle: CursorStyle.Blink,
        blinkSpeed: 800,
      },
      pauseFor: 2000,
      loop: true,
      autoStart: false,
      cursorStyle: CursorStyle.Solid,
      textEffect: TextEffect.FadeIn,
      cursorCharacter: '_',
      cursorBlink: false,
      easingFunction: (t) => t * t,
      html: true,
    };
    engine = new TypecraftEngine(container, options);
    expect(engine).toBeInstanceOf(TypecraftEngine);
  });

  it('should type a string', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    const typeCompleteSpy = vi.fn();
    engine.on('typeComplete', typeCompleteSpy);
    engine.start();
    await vi.waitFor(() => expect(typeCompleteSpy).toHaveBeenCalled());
    expect(container.textContent).toBe('Test');
  });

  it('should delete characters', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    const deleteCompleteSpy = vi.fn();
    engine.on('deleteComplete', deleteCompleteSpy);
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    engine.deleteChars(2);
    await vi.waitFor(() => expect(deleteCompleteSpy).toHaveBeenCalled());
    expect(container.textContent).toBe('Te');
  });

  it('should delete all characters', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    const deleteCompleteSpy = vi.fn();
    engine.on('deleteComplete', deleteCompleteSpy);
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    engine.deleteAll();
    await vi.waitFor(() => expect(deleteCompleteSpy).toHaveBeenCalled());
    expect(container.textContent).toBe('');
  });

  it('should pause for specified duration', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    const pauseEndSpy = vi.fn();
    engine.on('pauseEnd', pauseEndSpy);
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    engine.pauseFor(1000);
    await vi.waitFor(() => expect(pauseEndSpy).toHaveBeenCalled(), { timeout: 1500 });
  });

  it('should change typing speed', async () => {
    engine = new TypecraftEngine(container, {
      strings: ['Test'],
      autoStart: false,
      speed: { type: 100, delete: 50, delay: 1000 },
    });
    engine.changeTypeSpeed(50);
    engine.start();
    const startTime = Date.now();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(400); // 4 characters * 50ms + some buffer
  });

  it('should change delete speed', async () => {
    engine = new TypecraftEngine(container, {
      strings: ['Test'],
      autoStart: false,
      speed: { type: 50, delete: 100, delay: 1000 },
    });
    engine.changeDeleteSpeed(50);
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    const startTime = Date.now();
    engine.deleteAll();
    await vi.waitFor(() => expect(container.textContent).toBe(''));
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(400); // 4 characters * 50ms + some buffer
  });

  it('should change text direction', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    engine.setDirection(Direction.RTL);
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    expect(container.style.direction).toBe('rtl');
  });

  it('should change cursor style', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    engine.changeCursorStyle(CursorStyle.Solid);
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    const cursorElement = container.querySelector('.typecraft-cursor');
    expect(cursorElement?.classList.contains('typecraft-cursor-solid')).toBe(true);
  });

  it('should change cursor', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    engine.changeCursor('_');
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    const cursorElement = container.querySelector('.typecraft-cursor');
    expect(cursorElement?.textContent).toBe('_');
  });

  it('should apply text effect', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    engine.changeTextEffect(TextEffect.FadeIn);
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test'));
    const characters = container.querySelectorAll('span');
    characters.forEach((char) => {
      expect(char.style.opacity).toBe('1');
      expect(char.style.transition).toBeTruthy();
    });
  });

  it('should handle loop option', async () => {
    engine = new TypecraftEngine(container, {
      strings: ['Test1', 'Test2'],
      loop: true,
      autoStart: false,
    });
    const completeSpy = vi.fn();
    engine.on('complete', completeSpy);
    engine.start();
    await vi.waitFor(() => expect(container.textContent).toBe('Test1'));
    await vi.waitFor(() => expect(container.textContent).toBe('Test2'));
    await vi.waitFor(() => expect(container.textContent).toBe('Test1'));
    expect(completeSpy).not.toHaveBeenCalled();
  });

  it('should stop typing', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], autoStart: false });
    engine.start();
    await vi.waitFor(() => expect(container.textContent?.length).toBeGreaterThan(0));
    engine.stop();
    const currentText = container.textContent;
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(container.textContent).toBe(currentText);
  });

  it('should handle empty string', async () => {
    engine = new TypecraftEngine(container, { strings: [''], autoStart: false });
    const completeSpy = vi.fn();
    engine.on('complete', completeSpy);
    engine.start();
    await vi.waitFor(() => expect(completeSpy).toHaveBeenCalled());
    expect(container.textContent).toBe('');
  });

  it('should handle multiple operations', async () => {
    engine = new TypecraftEngine(container, { autoStart: false });
    const completeSpy = vi.fn();
    engine.on('complete', completeSpy);

    engine.typeString('Hello').pauseFor(100).deleteChars(2).typeString(' World').start();

    await vi.waitFor(() => expect(container.textContent).toBe('Hello'));
    await vi.waitFor(() => expect(container.textContent).toBe('Hel'));
    await vi.waitFor(() => expect(container.textContent).toBe('Hel World'));
    await vi.waitFor(() => expect(completeSpy).toHaveBeenCalled());
  }, 10000);
});
