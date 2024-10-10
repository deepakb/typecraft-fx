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
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      setTimeout(() => cb(performance.now()), 0);
      return 0;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('applyFadeInEffect', () => {
    it('should apply fade in effect', () => {
      const resolveMock = vi.fn();
      (effectManager as any).applyFadeInEffect(mockNode, 0, resolveMock, mockEasingManager);

      expect(mockNode.style.opacity).toBe('0');
      vi.advanceTimersByTime(100);
      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
    });
  });

  describe('applySlideInEffect', () => {
    it('should apply slide in effect', () => {
      const resolveMock = vi.fn();
      (effectManager as any).applySlideInEffect(mockNode, 0, resolveMock, mockEasingManager);

      expect(mockNode.style.transform).toBe('translateY(20px)');
      expect(mockNode.style.opacity).toBe('0');
      vi.advanceTimersByTime(200);
      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
    });
  });

  describe('applyGlitchEffect', () => {
    it('should apply glitch effect', () => {
      const resolveMock = vi.fn();
      mockNode.textContent = 'A';
      (effectManager as any).applyGlitchEffect(mockNode, 0, resolveMock, mockEasingManager);

      vi.advanceTimersByTime(200);
      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
      expect(mockNode.textContent).toBe('A');
    });
  });

  describe('applyTypecraftEffect', () => {
    it('should apply typecraft effect', () => {
      const resolveMock = vi.fn();
      const getTypeSpeed = vi.fn().mockReturnValue(100);
      (effectManager as any).applyTypecraftEffect(
        mockNode,
        0,
        getTypeSpeed,
        resolveMock,
        mockEasingManager
      );

      expect(mockNode.style.visibility).toBe('hidden');
      vi.advanceTimersByTime(50);
      expect(mockNode.style.visibility).toBe('visible');
      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
    });
  });

  describe('applyRainbowEffect', () => {
    it('should apply rainbow effect', () => {
      const resolveMock = vi.fn();
      (effectManager as any).applyRainbowEffect(mockNode, 0, resolveMock, mockEasingManager);

      expect(mockNode.style.color).toBe('red');
      expect(mockNode.style.opacity).toBe('0');
      vi.advanceTimersByTime(100);
      expect(mockEasingManager.applyEasing).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
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
