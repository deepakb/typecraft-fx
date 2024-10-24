import { EasingManager } from './EasingManager';
import { CustomEffectFunction, TextEffect } from './types';
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { logger } from './TypecraftLogger';

export class EffectManager {
  private continuousEffects: Map<HTMLElement, number> = new Map();
  private customEffects: Map<string, CustomEffectFunction> = new Map();

  public registerCustomEffect(name: string, effectFunction: CustomEffectFunction): void {
    if (!name || typeof name !== 'string') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid effect name. Must be a non-empty string.',
        ErrorSeverity.HIGH,
        { name }
      );
    }
    if (typeof effectFunction !== 'function') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid effect function. Must be a function.',
        ErrorSeverity.HIGH,
        { effectFunction }
      );
    }
    this.customEffects.set(name, effectFunction);
    logger.debug('Custom effect registered', { name });
  }

  public async applyTextEffect(
    effect: TextEffect | string,
    node: HTMLElement,
    index: number,
    getTypeSpeed: () => number,
    easingManager: EasingManager,
    color?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!node || !(node instanceof HTMLElement)) {
        reject(
          new TypecraftError(
            ErrorCode.INVALID_ELEMENT,
            'Invalid node. Must be an HTMLElement.',
            ErrorSeverity.HIGH,
            { node }
          )
        );
        return;
      }

      if (color) {
        node.style.color = color;
      }

      try {
        switch (effect) {
          case TextEffect.FadeIn:
            this.applyFadeInEffect(node, resolve, easingManager);
            break;
          case TextEffect.SlideIn:
            this.applySlideInEffect(node, index, resolve, easingManager);
            break;
          case TextEffect.Glitch:
            this.applyGlitchEffect(node, index, resolve, easingManager);
            break;
          case TextEffect.Typecraft:
            this.applyTypecraftEffect(node, index, getTypeSpeed, resolve, easingManager);
            break;
          case TextEffect.Rainbow:
            this.applyRainbowEffect(node, index, resolve);
            break;
          case TextEffect.Continuous:
            this.applyContinuousEffect(node, (node, progress) => {
              node.style.opacity = (0.7 + Math.sin(progress * Math.PI * 2) * 0.3).toString();
            });
            resolve();
            break;
          case TextEffect.Custom:
          default:
            if (typeof effect === 'string' && this.customEffects.has(effect)) {
              const customEffect = this.customEffects.get(effect)!;
              customEffect(node, index, getTypeSpeed, easingManager);
              resolve();
            } else {
              reject(
                new TypecraftError(
                  ErrorCode.INVALID_OPTIONS,
                  `Unknown effect: ${effect}`,
                  ErrorSeverity.HIGH,
                  { effect }
                )
              );
            }
            break;
        }
      } catch (error) {
        reject(
          new TypecraftError(
            ErrorCode.RUNTIME_ERROR,
            'Error applying text effect',
            ErrorSeverity.HIGH,
            { error, effect }
          )
        );
      }
    });
  }

  private applyFadeInEffect(
    node: HTMLElement,
    resolve: () => void,
    easingManager: EasingManager
  ): void {
    node.style.opacity = '0';
    const duration = 100; // 0.1s in milliseconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easingManager.applyEasing(progress);
      node.style.opacity = easedProgress.toString();

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    window.requestAnimationFrame(animate);
  }

  private applySlideInEffect(
    node: HTMLElement,
    index: number,
    resolve: () => void,
    easingManager: EasingManager
  ): void {
    node.style.transform = 'translateY(20px)';
    node.style.opacity = '0';
    const duration = 200; // 0.2s in milliseconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easingManager.applyEasing(progress);

      node.style.transform = `translateY(${20 * (1 - easedProgress)}px)`;
      node.style.opacity = easedProgress.toString();

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    setTimeout(() => window.requestAnimationFrame(animate), index * 20);
  }

  private applyGlitchEffect(
    node: HTMLElement,
    index: number,
    resolve: () => void,
    easingManager: EasingManager
  ): void {
    const glitchChars = '!@#$%^&*()_+-={}[]|;:,.<>?';
    const originalChar = node.textContent || '';
    const duration = 200; // 0.2s in milliseconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easingManager.applyEasing(progress);

      if (progress < 1) {
        if (Math.random() < easedProgress) {
          node.textContent = originalChar;
        } else {
          node.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        window.requestAnimationFrame(animate);
      } else {
        node.textContent = originalChar;
        resolve();
      }
    };

    setTimeout(() => window.requestAnimationFrame(animate), index * 25);
  }

  private applyTypecraftEffect(
    node: HTMLElement,
    index: number,
    getTypeSpeed: () => number,
    resolve: () => void,
    easingManager: EasingManager
  ): void {
    node.style.visibility = 'hidden';
    const typeSpeed = getTypeSpeed();
    const easedDelay = easingManager.applyEasing(index) * typeSpeed;
    setTimeout(() => {
      node.style.visibility = 'visible';
      resolve();
    }, easedDelay);
  }

  private applyRainbowEffect(node: HTMLElement, index: number, resolve: () => void): void {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    const text = node.textContent || '';
    node.textContent = '';

    const colorNextChar = (charIndex: number) => {
      if (charIndex < text.length) {
        const span = document.createElement('span');
        span.textContent = text[charIndex];
        const colorIndex = (index + charIndex) % colors.length;
        span.style.color = colors[colorIndex];
        node.appendChild(span);

        setTimeout(() => colorNextChar(charIndex + 1), 50);
      } else {
        resolve();
      }
    };

    colorNextChar(0);
  }

  public applyContinuousEffect(
    node: HTMLElement,
    effect: (node: HTMLElement, progress: number) => void
  ): void {
    if (!node || !(node instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_ELEMENT,
        'Invalid node. Must be an HTMLElement.',
        ErrorSeverity.HIGH,
        { node }
      );
    }
    if (typeof effect !== 'function') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid effect function. Must be a function.',
        ErrorSeverity.HIGH,
        { effect }
      );
    }

    const animate = (time: number) => {
      const progress = (time % 1000) / 1000; // 1-second loop
      try {
        effect(node, progress);
        this.continuousEffects.set(node, window.requestAnimationFrame(animate));
      } catch (error) {
        this.stopContinuousEffect(node);
        throw new TypecraftError(
          ErrorCode.RUNTIME_ERROR,
          'Error in continuous effect',
          ErrorSeverity.HIGH,
          { error, node }
        );
      }
    };
    this.continuousEffects.set(node, window.requestAnimationFrame(animate));
    logger.debug('Continuous effect applied', { node });
  }

  public stopContinuousEffect(node: HTMLElement): void {
    if (!node || !(node instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_ELEMENT,
        'Invalid node. Must be an HTMLElement.',
        ErrorSeverity.HIGH,
        { node }
      );
    }

    const animationId = this.continuousEffects.get(node);
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      this.continuousEffects.delete(node);
      logger.debug('Continuous effect stopped', { node });
    }
  }

  public resetEffectStyles(nodes: HTMLElement[], effect: TextEffect): void {
    if (!Array.isArray(nodes) || !nodes.every((node) => node instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid nodes. Must be an array of HTMLElements.',
        ErrorSeverity.HIGH,
        { nodes }
      );
    }
    if (!Object.values(TextEffect).includes(effect)) {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid effect. Must be a valid TextEffect.',
        ErrorSeverity.HIGH,
        { effect }
      );
    }

    nodes.forEach((node) => {
      node.style.transition = '';
      node.style.transform = '';
      node.style.opacity = '';
      node.style.visibility = '';
      if (effect !== TextEffect.Rainbow) {
        node.style.color = '';
      }
    });
    logger.debug('Effect styles reset', { effect, nodeCount: nodes.length });
  }
}
