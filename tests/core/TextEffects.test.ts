import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextEffectManager } from '../../src/core/TextEffects';
import { TextEffect } from '../../src/core/types';

describe('TextEffectManager', () => {
  let textEffectManager: TextEffectManager;
  let mockElement: HTMLElement;

  beforeEach(() => {
    textEffectManager = new TextEffectManager();
    mockElement = document.createElement('div');
    vi.useFakeTimers();
  });

  it('should set the current effect', () => {
    textEffectManager.setEffect(TextEffect.FadeIn);
    expect((textEffectManager as any).currentEffect).toBe(TextEffect.FadeIn);
  });

  it('should apply no effect when TextEffect.None is set', () => {
    textEffectManager.setEffect(TextEffect.None);
    textEffectManager.applyEffect(mockElement, 'Hello');
    expect(mockElement.textContent).toBe('Hello');
  });

  it('should apply fade in effect', () => {
    textEffectManager.setEffect(TextEffect.FadeIn);
    textEffectManager.applyEffect(mockElement, 'Hello');

    expect(mockElement.children.length).toBe(1);
    const span = mockElement.children[0] as HTMLSpanElement;
    expect(span.textContent).toBe('Hello');
    expect(span.style.opacity).toBe('0');

    vi.runAllTimers();

    expect(span.style.transition).toBe('opacity 0.1s ease-in-out');
    expect(span.style.opacity).toBe('1');
  });

  it('should apply slide in effect', () => {
    textEffectManager.setEffect(TextEffect.SlideIn);
    textEffectManager.applyEffect(mockElement, 'Hello');

    expect(mockElement.children.length).toBe(1);
    const span = mockElement.children[0] as HTMLSpanElement;
    expect(span.textContent).toBe('Hello');
    expect(span.style.transform).toBe('translateY(20px)');
    expect(span.style.opacity).toBe('0');

    vi.runAllTimers();

    expect(span.style.transition).toBe('transform 0.3s, opacity 0.3s');
    expect(span.style.transform).toBe('translateY(0)');
    expect(span.style.opacity).toBe('1');
  });
});
