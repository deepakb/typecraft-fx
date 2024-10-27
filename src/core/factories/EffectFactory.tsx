import { EasingManager } from '../managers/EasingManager';
import { ErrorCode, TypecraftError, ErrorSeverity } from '../error/TypecraftError';
import { CustomEffectFunction, TextEffect } from '../../types';
import { logger } from '../logging/TypecraftLogger';
import { ErrorHandler } from '../../utils/ErrorHandler';

export interface IBaseEffect {
  apply(node: HTMLElement, index: number, speed: number): Promise<void>;
}

export abstract class BaseEffect implements IBaseEffect {
  constructor(protected easingManager: EasingManager) {}
  abstract apply(node: HTMLElement, index: number, speed: number): Promise<void>;
}

export interface IEffectFactory {
  createEffect(effect: TextEffect): BaseEffect;
  createCustomEffect(effectFunction: CustomEffectFunction): BaseEffect;
}

export class EffectFactory implements IEffectFactory {
  constructor(private easingManager: EasingManager) {
    logger.debug('EffectFactory initialized');
  }

  public createEffect(effect: TextEffect): BaseEffect {
    this.validateTextEffect(effect);
    switch (effect) {
      case TextEffect.FadeIn:
        return new FadeInEffect(this.easingManager);
      case TextEffect.SlideIn:
        return new SlideInEffect(this.easingManager);
      case TextEffect.Glitch:
        return new GlitchEffect(this.easingManager);
      case TextEffect.Typecraft:
        return new TypecraftEffect(this.easingManager);
      case TextEffect.Rainbow:
        return new RainbowEffect(this.easingManager);
      case TextEffect.Continuous:
        return new ContinuousEffect(this.easingManager);
      default:
        this.handleError(
          new Error(`Unknown effect: ${effect}`),
          `Unknown effect: ${effect}`,
          { effect },
          ErrorSeverity.HIGH
        );
    }
  }

  public createCustomEffect(effectFunction: CustomEffectFunction): BaseEffect {
    this.validateCustomEffectFunction(effectFunction);
    return new CustomEffect(this.easingManager, effectFunction);
  }

  private validateTextEffect(effect: TextEffect): void {
    if (!Object.values(TextEffect).includes(effect)) {
      this.handleError(
        new Error('Invalid text effect'),
        'Invalid text effect provided',
        { effect },
        ErrorSeverity.HIGH
      );
    }
  }

  private validateCustomEffectFunction(effectFunction: CustomEffectFunction): void {
    if (typeof effectFunction !== 'function') {
      this.handleError(
        new Error('Invalid custom effect function'),
        'Invalid custom effect function provided',
        { effectFunction },
        ErrorSeverity.HIGH
      );
    }
  }

  private handleError(
    error: unknown,
    message: string,
    context: object = {},
    severity: ErrorSeverity = ErrorSeverity.HIGH
  ): never {
    ErrorHandler.handleError(error, message, context, severity);
  }
}

class FadeInEffect extends BaseEffect {
  async apply(node: HTMLElement, index: number, speed: number): Promise<void> {
    return new Promise((resolve) => {
      node.style.opacity = '0';
      const duration = 100;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = this.easingManager.applyEasing(progress);
        node.style.opacity = easedProgress.toString();

        if (progress < 1) {
          window.requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      window.requestAnimationFrame(animate);
    });
  }
}

class SlideInEffect extends BaseEffect {
  async apply(node: HTMLElement, index: number, speed: number): Promise<void> {
    return new Promise((resolve) => {
      node.style.transform = 'translateY(20px)';
      node.style.opacity = '0';
      const duration = 200;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = this.easingManager.applyEasing(progress);

        node.style.transform = `translateY(${20 * (1 - easedProgress)}px)`;
        node.style.opacity = easedProgress.toString();

        if (progress < 1) {
          window.requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      setTimeout(() => window.requestAnimationFrame(animate), index * 20);
    });
  }
}

class GlitchEffect extends BaseEffect {
  async apply(node: HTMLElement, index: number, speed: number): Promise<void> {
    return new Promise((resolve) => {
      const glitchChars = '!@#$%^&*()_+-={}[]|;:,.<>?';
      const originalChar = node.textContent || '';
      const duration = 200;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = this.easingManager.applyEasing(progress);

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
    });
  }
}

class TypecraftEffect extends BaseEffect {
  async apply(node: HTMLElement, index: number, speed: number): Promise<void> {
    return new Promise((resolve) => {
      node.style.visibility = 'hidden';
      const easedDelay = this.easingManager.applyEasing(index) * speed;
      setTimeout(() => {
        node.style.visibility = 'visible';
        resolve();
      }, easedDelay);
    });
  }
}

class RainbowEffect extends BaseEffect {
  async apply(node: HTMLElement, index: number, speed: number): Promise<void> {
    return new Promise((resolve) => {
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
    });
  }
}

class ContinuousEffect extends BaseEffect {
  apply(node: HTMLElement, index: number, speed: number): Promise<void> {
    return new Promise((resolve) => {
      const animate = (time: number) => {
        const progress = (time % 1000) / 1000; // 1-second loop
        node.style.opacity = (0.7 + Math.sin(progress * Math.PI * 2) * 0.3).toString();
        window.requestAnimationFrame(animate);
      };
      window.requestAnimationFrame(animate);
      resolve();
    });
  }
}

class CustomEffect extends BaseEffect {
  constructor(
    easingManager: EasingManager,
    private customEffectFunction: CustomEffectFunction
  ) {
    super(easingManager);
  }

  async apply(node: HTMLElement, index: number, speed: number): Promise<void> {
    await this.customEffectFunction(node, index, speed, this.easingManager);
  }
}
