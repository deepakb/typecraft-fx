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
    engine = new TypecraftEngine(container, { strings: ['Test'] });
    expect(engine).toBeInstanceOf(TypecraftEngine);
  });

  it('should type a string', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'] });
    const typeCompleteSpy = vi.fn();
    engine.on('typeComplete', typeCompleteSpy);
    await engine.start();
    expect(container.textContent).toBe('Test|');
    expect(typeCompleteSpy).toHaveBeenCalled();
  });

  it('should delete characters', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'] });
    const deleteCompleteSpy = vi.fn();
    engine.on('deleteComplete', deleteCompleteSpy);
    await engine.start();
    expect(container.textContent).toBe('Test|');
    await engine.deleteChars(2).start();
    expect(container.textContent).toBe('Te|');
    expect(deleteCompleteSpy).toHaveBeenCalled();
  });

  it('should delete all characters', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'] });
    const deleteCompleteSpy = vi.fn();
    engine.on('deleteComplete', deleteCompleteSpy);
    await engine.start();
    expect(container.textContent).toBe('Test|');
    await engine.deleteAll().start();
    expect(container.textContent).toBe('|');
    expect(deleteCompleteSpy).toHaveBeenCalled();
  });

  it('should pause for specified duration', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'] });
    const pauseEndSpy = vi.fn();
    engine.on('pauseEnd', pauseEndSpy);
    await engine.start();
    const startTime = Date.now();
    await engine.pauseFor(1000).start();
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    expect(pauseEndSpy).toHaveBeenCalled();
  });

  it('should change typing speed', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], speed: 100 });
    engine.changeSpeed(50);
    const startTime = Date.now();
    await engine.start();
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(400); // 4 characters * 50ms + some buffer
  });

  it('should change delete speed', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'], speed: 100 });
    engine.changeDeleteSpeed(50);
    await engine.start();
    const startTime = Date.now();
    await engine.deleteAll().start();
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(400); // 4 characters * 50ms + some buffer
  });

  it('should change text direction', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'] });
    engine.setDirection(Direction.RTL);
    await engine.start();
    expect(container.style.direction).toBe('rtl');
  });

  it('should change cursor style', async () => {
    const container = document.createElement('div');
    const engine = new TypecraftEngine(container, {
      strings: ['Test'],
      cursor: {
        style: CursorStyle.Solid,
        text: '|',
        color: 'black',
        blinkSpeed: 500,
        opacity: { min: 0, max: 1 },
        blink: false,
      },
    });
    await engine.start();

    // Wait for typing to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cursorElement = container.querySelector('.typecraft-cursor');
    console.log('Cursor element:', cursorElement);
    console.log('Cursor element class list:', cursorElement?.classList);
    console.log('Container innerHTML:', container.innerHTML);
    expect(cursorElement?.classList.contains('typecraft-cursor-solid')).toBe(true);
  });

  it('should change cursor', async () => {
    engine = new TypecraftEngine(container, { strings: ['Test'] });
    engine.changeCursor('_');
    await engine.start();
    const cursorElement = container.querySelector('.typecraft-cursor');
    expect(cursorElement?.textContent).toBe('_');
  });

  it('should apply text effect', async () => {
    const container = document.createElement('div');
    const engine = new TypecraftEngine(container, {
      strings: ['Test'],
      textEffect: TextEffect.FadeIn,
      autoStart: true,
      speed: 0, // Set speed to 0 to type instantly
    });

    console.log('Engine created');

    // Use a custom event to signal when typing is complete
    const typingComplete = new Promise<void>((resolve) => {
      engine.on('complete', () => {
        console.log('Typing complete event fired');
        resolve();
      });
    });

    await engine.start();
    console.log('Engine started');
    await typingComplete;
    console.log('Typing complete');

    const characters = container.querySelectorAll('span:not(.typecraft-cursor)');
    console.log('Number of characters:', characters.length);
    console.log('Container innerHTML:', container.innerHTML);

    // Wait for all characters to reach full opacity
    await new Promise<void>((resolve) => {
      const checkOpacity = () => {
        const allFullOpacity = Array.from(characters).every(
          (char) => (char as HTMLElement).style.opacity === '1'
        );
        if (allFullOpacity) {
          console.log('All characters reached full opacity');
          resolve();
        } else {
          console.log('Not all characters at full opacity, checking again...');
          setTimeout(checkOpacity, 100);
        }
      };
      checkOpacity();
    });

    // Verify the final state
    characters.forEach((char) => {
      const htmlChar = char as HTMLElement;
      console.log('Character opacity:', htmlChar.style.opacity);
      console.log('Character transition:', htmlChar.style.transition);
      expect(htmlChar.style.opacity).toBe('1');
      expect(htmlChar.style.transition).toBe('opacity 0.1s ease-in-out');
    });

    console.log('Test completed successfully');
  }, 15000); // Increase the timeout to 15 seconds

  it('should handle loop option', async () => {
    const container = document.createElement('div');
    const options: Partial<TypecraftOptions> = {
      strings: ['Hello', 'World'],
      loop: true,
      speed: 0,
      pauseFor: 0,
    };
    const typecraft = new TypecraftEngine(container, options);

    let loopCount = 0;
    const maxLoops = 2;

    return new Promise<void>((resolve, reject) => {
      typecraft.on('complete', () => {
        loopCount++;
        if (loopCount === maxLoops) {
          typecraft.stop();
          expect(loopCount).toBe(maxLoops);
          resolve();
        }
      });

      typecraft.start();

      // Set a timeout to prevent the test from hanging indefinitely
      setTimeout(() => {
        reject(new Error('Test timed out'));
      }, 5000); // Increase timeout to 5 seconds
    });
  }, 6000);

  it('should handle empty string', async () => {
    engine = new TypecraftEngine(container, { strings: [''] });
    const completeSpy = vi.fn();
    engine.on('complete', completeSpy);
    await engine.start();
    expect(container.textContent).toBe('|');
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle multiple operations', async () => {
    engine = new TypecraftEngine(container, {
      cursor: {
        text: '|',
        color: 'red',
        blinkSpeed: 500,
        opacity: { min: 0.5, max: 1 },
        style: CursorStyle.Solid,
        blink: false,
      },
    });
    const completeSpy = vi.fn();
    engine.on('complete', completeSpy);

    await engine.typeString('Hello').pauseFor(100).deleteChars(2).typeString(' World').start();

    expect(container.textContent).toBe('Hel World|');
    expect(completeSpy).toHaveBeenCalled();
  });
});
