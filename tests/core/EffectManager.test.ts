import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EffectManager } from '../../src/core/EffectsManager';
import { EasingManager } from '../../src/core/EasingManager';
import { TextEffect } from '../../src/core/types';

describe('EffectManager', () => {
  let effectManager: EffectManager;
  let mockEasingManager: EasingManager;
  let mockNode: HTMLElement;

  beforeEach(() => {
    effectManager = new EffectManager();
    mockEasingManager = {
      applyEasing: vi.fn().mockReturnValue(0.5),
    } as any;
    mockNode = document.createElement('div');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('applyFadeInEffect', () => {
    it('should apply fade in effect', async () => {
      const resolveMock = vi.fn();
      const animationPromise = (effectManager as any).applyFadeInEffect(
        mockNode,
        resolveMock,
        mockEasingManager
      );

      // Advance timers and run microtasks
      vi.advanceTimersByTime(100);
      await Promise.resolve();

      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
      expect(mockNode.style.opacity).toBe('0.5');

      await animationPromise;
    });
  });

  describe('applySlideInEffect', () => {
    it('should apply slide in effect', async () => {
      const resolveMock = vi.fn();
      const animationPromise = (effectManager as any).applySlideInEffect(
        mockNode,
        0,
        resolveMock,
        mockEasingManager
      );

      // Advance timers and run microtasks
      vi.advanceTimersByTime(220); // 200ms for animation + 20ms for setTimeout
      await Promise.resolve();

      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
      expect(mockNode.style.transform).toBe('translateY(10px)');
      expect(mockNode.style.opacity).toBe('0.5');

      await animationPromise;
    });
  });

  describe('applyGlitchEffect', () => {
    it('should apply glitch effect', async () => {
      const resolveMock = vi.fn();
      mockNode.textContent = 'A';
      const animationPromise = (effectManager as any).applyGlitchEffect(
        mockNode,
        0,
        resolveMock,
        mockEasingManager
      );

      // Advance timers and run microtasks
      vi.advanceTimersByTime(225); // 200ms for animation + 25ms for setTimeout
      await Promise.resolve();

      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
      expect(mockNode.textContent).toBe('A');

      await animationPromise;
    });
  });

  describe('applyTypecraftEffect', () => {
    it('should apply typecraft effect', async () => {
      const resolveMock = vi.fn();
      const getTypeSpeed = vi.fn().mockReturnValue(100);
      const animationPromise = (effectManager as any).applyTypecraftEffect(
        mockNode,
        0,
        getTypeSpeed,
        resolveMock,
        mockEasingManager
      );

      expect(mockNode.style.visibility).toBe('hidden');

      // Advance timers and run microtasks
      vi.advanceTimersByTime(50);
      await Promise.resolve();

      expect(mockNode.style.visibility).toBe('visible');
      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();

      await animationPromise;
    });
  });

  describe('applyRainbowEffect', () => {
    it('should apply rainbow effect', async () => {
      const resolveMock = vi.fn();
      mockNode.textContent = 'Test';
      const animationPromise = (effectManager as any).applyRainbowEffect(
        mockNode,
        0,
        resolveMock,
        mockEasingManager
      );

      // Advance timers and run microtasks
      vi.advanceTimersByTime(200);
      await Promise.resolve();

      expect(mockNode.children.length).toBe(4);
      expect((mockNode.children[0] as HTMLElement).style.color).toBe('red');
      expect((mockNode.children[1] as HTMLElement).style.color).toBe('orange');
      expect((mockNode.children[2] as HTMLElement).style.color).toBe('yellow');
      expect((mockNode.children[3] as HTMLElement).style.color).toBe('green');
      expect(resolveMock).toHaveBeenCalled();

      await animationPromise;
    });
  });

  describe('resetEffectStyles', () => {
    it('should reset styles for non-rainbow effects', () => {
      const nodes = [mockNode];
      effectManager.resetEffectStyles(nodes, TextEffect.FadeIn);

      expect(mockNode.style.transition).toBe('');
      expect(mockNode.style.transform).toBe('');
      expect(mockNode.style.opacity).toBe('');
      expect(mockNode.style.visibility).toBe('');
      expect(mockNode.style.color).toBe('');
    });

    it('should not reset color for rainbow effect', () => {
      const nodes = [mockNode];
      mockNode.style.color = 'red';
      effectManager.resetEffectStyles(nodes, TextEffect.Rainbow);

      expect(mockNode.style.color).toBe('red');
    });
  });
});
