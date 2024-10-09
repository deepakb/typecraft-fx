import { TextEffectManager } from '../../src/core/TextEffectManager';
import { TextEffect } from '../../src/core/types';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('TextEffectManager', () => {
  let textEffectManager: TextEffectManager;
  let node: HTMLElement;
  let getTypeSpeed: () => number;

  beforeEach(() => {
    textEffectManager = new TextEffectManager();
    node = document.createElement('span');
    getTypeSpeed = vi.fn(() => 50);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('applyTextEffect', () => {
    it('should apply FadeIn effect', async () => {
      const promise = textEffectManager.applyTextEffect(TextEffect.FadeIn, node, 0, getTypeSpeed);
      vi.runAllTimers();
      await promise;
      expect(node.style.opacity).toBe('1');
    });

    it('should apply SlideIn effect', async () => {
      const promise = textEffectManager.applyTextEffect(TextEffect.SlideIn, node, 0, getTypeSpeed);
      vi.runAllTimers();
      await promise;
      expect(node.style.transform).toBe('translateY(0)');
      expect(node.style.opacity).toBe('1');
    });

    it('should apply Glitch effect', async () => {
      node.textContent = 'A';
      const promise = textEffectManager.applyTextEffect(TextEffect.Glitch, node, 0, getTypeSpeed);
      vi.runAllTimers();
      await promise;
      expect(node.textContent).toBe('A');
    });

    it('should apply Typecraft effect', async () => {
      const promise = textEffectManager.applyTextEffect(
        TextEffect.Typecraft,
        node,
        0,
        getTypeSpeed
      );
      vi.runAllTimers();
      await promise;
      expect(node.style.visibility).toBe('visible');
    });

    it('should apply Rainbow effect', async () => {
      const promise = textEffectManager.applyTextEffect(TextEffect.Rainbow, node, 0, getTypeSpeed);
      vi.runAllTimers();
      await promise;
      expect(node.style.opacity).toBe('1');
      expect(node.style.color).toBe('red');
    });

    it('should resolve immediately for None effect', async () => {
      const promise = textEffectManager.applyTextEffect(TextEffect.None, node, 0, getTypeSpeed);
      await promise;
      expect(node.style.cssText).toBe('');
    });
  });

  describe('resetEffectStyles', () => {
    it('should reset styles for non-Rainbow effects', () => {
      const nodes = [
        Object.assign(document.createElement('span'), {
          style: {
            transition: 'all 0.3s',
            transform: 'translateY(10px)',
            opacity: '0.5',
            visibility: 'hidden',
            color: 'blue',
          },
        }),
      ];
      textEffectManager.resetEffectStyles(nodes, TextEffect.FadeIn);
      expect(nodes[0].style.cssText).toBe('');
    });

    it('should reset styles for Rainbow effect (keeping color)', () => {
      const nodes = [
        Object.assign(document.createElement('span'), {
          style: {
            transition: 'all 0.3s',
            transform: 'translateY(10px)',
            opacity: '0.5',
            visibility: 'hidden',
            color: 'blue',
          },
        }),
      ];
      textEffectManager.resetEffectStyles(nodes, TextEffect.Rainbow);
      expect(nodes[0].style.cssText).toBe('color: blue;');
    });
  });

  // Test private methods indirectly through applyTextEffect
  describe('private methods', () => {
    it('should apply FadeIn effect correctly', async () => {
      const promise = textEffectManager.applyTextEffect(TextEffect.FadeIn, node, 0, getTypeSpeed);
      expect(node.style.opacity).toBe('0');
      expect(node.style.transition).toBe('opacity 0.1s ease-in-out');
      vi.runAllTimers();
      await promise;
      expect(node.style.opacity).toBe('1');
    });

    it('should apply SlideIn effect correctly', async () => {
      const promise = textEffectManager.applyTextEffect(TextEffect.SlideIn, node, 1, getTypeSpeed);
      expect(node.style.transform).toBe('translateY(20px)');
      expect(node.style.opacity).toBe('0');
      vi.advanceTimersByTime(20);
      expect(node.style.transform).toBe('translateY(0)');
      expect(node.style.opacity).toBe('1');
      vi.runAllTimers();
      await promise;
    });

    it('should apply Glitch effect correctly', async () => {
      node.textContent = 'A';
      const promise = textEffectManager.applyTextEffect(TextEffect.Glitch, node, 1, getTypeSpeed);
      vi.advanceTimersByTime(50);
      expect(node.textContent).not.toBe('A');
      vi.runAllTimers();
      await promise;
      expect(node.textContent).toBe('A');
    });

    it('should apply Typecraft effect correctly', async () => {
      const promise = textEffectManager.applyTextEffect(
        TextEffect.Typecraft,
        node,
        1,
        getTypeSpeed
      );
      expect(node.style.visibility).toBe('hidden');
      vi.advanceTimersByTime(50);
      expect(node.style.visibility).toBe('visible');
      vi.runAllTimers();
      await promise;
    });

    it('should apply Rainbow effect correctly', async () => {
      const promise = textEffectManager.applyTextEffect(TextEffect.Rainbow, node, 1, getTypeSpeed);
      expect(node.style.color).toBe('orange');
      expect(node.style.opacity).toBe('0');
      vi.advanceTimersByTime(20);
      expect(node.style.opacity).toBe('1');
      vi.runAllTimers();
      await promise;
    });
  });
});
