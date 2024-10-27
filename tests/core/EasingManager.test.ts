import { describe, it, expect, beforeEach } from 'vitest';
import { EasingManager } from '../../src/core/managers/EasingManager';
import { CursorStyle, Direction, TextEffect, TypecraftOptions } from '../../src/types';

describe('EasingManager', () => {
  let easingManager: EasingManager;
  let defaultOptions: TypecraftOptions;

  beforeEach(() => {
    defaultOptions = {
      strings: [],
      speed: { type: 50, delete: 50, delay: 1500 },
      pauseFor: 1500,
      loop: false,
      autoStart: false,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 500,
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Solid,
        blink: false,
      },
      direction: Direction.LTR,
      textEffect: TextEffect.None,
      easingFunction: (t: number) => t,
      html: false,
    };
    easingManager = new EasingManager(defaultOptions);
  });

  it('should use default easing function when no custom function is provided', () => {
    const result = easingManager.getEasing()(0.5);
    expect(result).toBe(0.5);
  });

  it('should use custom easing function when provided', () => {
    const customEasing = (t: number) => t * t;
    defaultOptions.easingFunction = customEasing;
    easingManager = new EasingManager(defaultOptions);
    const result = easingManager.getEasing()(0.5);
    expect(result).toBe(0.25);
  });

  it('should set a new easing function', () => {
    const newEasing = (t: number) => t * t * t;
    easingManager.setEasingFunction(newEasing);
    const result = easingManager.getEasing()(0.5);
    expect(result).toBe(0.125);
  });

  it('should apply easing to a value', () => {
    const customEasing = (t: number) => t * 2;
    easingManager.setEasingFunction(customEasing);
    const result = easingManager.applyEasing(0.5);
    expect(result).toBe(1);
  });

  it('should apply default easing when no custom easing is set', () => {
    const result = easingManager.applyEasing(0.5);
    expect(result).toBe(0.5);
  });
});
