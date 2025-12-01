import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EffectManager } from '../../src/core/managers/EffectManager';
import { EasingManager } from '../../src/core/managers/EasingManager';
import { TextEffect } from '../../src/types';
import { EffectFactory } from '../../src/core/factories/EffectFactory';
import { IDomManager } from '../../src/core/managers/DomManager';

describe('EffectManager', () => {
  let effectManager: EffectManager;
  let mockEasingManager: EasingManager;
  let mockDomManager: IDomManager;
  let mockNode: HTMLElement;
  let mockLogger: any;
  let mockErrorHandler: any;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    mockErrorHandler = {
      handleError: vi.fn(),
    };
    mockEasingManager = {
      applyEasing: vi.fn().mockReturnValue(0.5),
    } as any;

    mockDomManager = {
      createElement: vi.fn(),
      createTextNode: vi.fn(),
      appendChild: vi.fn(),
      insertBefore: vi.fn(),
      removeElement: vi.fn(),
      setAttribute: vi.fn(),
      setTextContent: vi.fn(),
      setStyle: vi.fn().mockImplementation((element, property, value) => {
        (element.style as any)[property] = value;
      }),
      createLineBreak: vi.fn(),
      createSpace: vi.fn(),
    } as unknown as IDomManager;

    effectManager = new EffectManager(mockEasingManager, mockDomManager, mockLogger, mockErrorHandler);
    mockNode = document.createElement('div');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('applyTextEffect', () => {
    it('should apply FadeIn effect', async () => {
      const createEffectSpy = vi.spyOn(EffectFactory.prototype, 'createEffect');
      const applySpy = vi.fn().mockResolvedValue(undefined);
      createEffectSpy.mockReturnValue({ apply: applySpy } as any);

      await effectManager.applyTextEffect(TextEffect.FadeIn, mockNode, 0, 100);

      expect(createEffectSpy).toHaveBeenCalledWith(TextEffect.FadeIn);
      expect(applySpy).toHaveBeenCalledWith(mockNode, 0, 100);
    });

    it('should apply SlideIn effect', async () => {
      const createEffectSpy = vi.spyOn(EffectFactory.prototype, 'createEffect');
      const applySpy = vi.fn().mockResolvedValue(undefined);
      createEffectSpy.mockReturnValue({ apply: applySpy } as any);

      await effectManager.applyTextEffect(TextEffect.SlideIn, mockNode, 0, 100);

      expect(createEffectSpy).toHaveBeenCalledWith(TextEffect.SlideIn);
      expect(applySpy).toHaveBeenCalledWith(mockNode, 0, 100);
    });

    it('should apply Glitch effect', async () => {
      const createEffectSpy = vi.spyOn(EffectFactory.prototype, 'createEffect');
      const applySpy = vi.fn().mockResolvedValue(undefined);
      createEffectSpy.mockReturnValue({ apply: applySpy } as any);

      await effectManager.applyTextEffect(TextEffect.Glitch, mockNode, 0, 100);

      expect(createEffectSpy).toHaveBeenCalledWith(TextEffect.Glitch);
      expect(applySpy).toHaveBeenCalledWith(mockNode, 0, 100);
    });

    it('should apply Typecraft effect', async () => {
      const createEffectSpy = vi.spyOn(EffectFactory.prototype, 'createEffect');
      const applySpy = vi.fn().mockResolvedValue(undefined);
      createEffectSpy.mockReturnValue({ apply: applySpy } as any);

      await effectManager.applyTextEffect(TextEffect.Typecraft, mockNode, 0, 100);

      expect(createEffectSpy).toHaveBeenCalledWith(TextEffect.Typecraft);
      expect(applySpy).toHaveBeenCalledWith(mockNode, 0, 100);
    });

    it('should apply Rainbow effect', async () => {
      const createEffectSpy = vi.spyOn(EffectFactory.prototype, 'createEffect');
      const applySpy = vi.fn().mockResolvedValue(undefined);
      createEffectSpy.mockReturnValue({ apply: applySpy } as any);

      await effectManager.applyTextEffect(TextEffect.Rainbow, mockNode, 0, 100);

      expect(createEffectSpy).toHaveBeenCalledWith(TextEffect.Rainbow);
      expect(applySpy).toHaveBeenCalledWith(mockNode, 0, 100);
    });

    it('should handle errors during effect application', async () => {
      const createEffectSpy = vi.spyOn(EffectFactory.prototype, 'createEffect');
      const error = new Error('Effect failed');
      const applySpy = vi.fn().mockRejectedValue(error);
      createEffectSpy.mockReturnValue({ apply: applySpy } as any);

      await effectManager.applyTextEffect(TextEffect.FadeIn, mockNode, 0, 100);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        error,
        'Error applying text effect',
        expect.any(Object),
        expect.any(String)
      );
    });
  });

  describe('resetEffectStyles', () => {
    it('should reset styles for non-rainbow effects', () => {
      const nodes = [mockNode];
      mockNode.style.opacity = '0.5';
      effectManager.resetEffectStyles(nodes, TextEffect.FadeIn);

      expect(mockDomManager.setStyle).toHaveBeenCalledWith(mockNode, 'transition', '');
      expect(mockDomManager.setStyle).toHaveBeenCalledWith(mockNode, 'transform', '');
      expect(mockDomManager.setStyle).toHaveBeenCalledWith(mockNode, 'opacity', '');
      expect(mockDomManager.setStyle).toHaveBeenCalledWith(mockNode, 'visibility', '');
      expect(mockDomManager.setStyle).toHaveBeenCalledWith(mockNode, 'color', '');
    });

    it('should not reset color for rainbow effect', () => {
      const nodes = [mockNode];
      mockNode.style.color = 'red';
      effectManager.resetEffectStyles(nodes, TextEffect.Rainbow);

      expect(mockDomManager.setStyle).not.toHaveBeenCalledWith(mockNode, 'color', '');
    });
  });
});
