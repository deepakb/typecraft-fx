import { EasingManager } from './EasingManager';
import { CustomEffectFunction, TextEffect } from './types';

export class EffectManager {
  private continuousEffects: Map<HTMLElement, number> = new Map();
  private customEffects: Map<string, CustomEffectFunction> = new Map();

  public registerCustomEffect(name: string, effectFunction: CustomEffectFunction): void {
    this.customEffects.set(name, effectFunction);
  }

  public async applyTextEffect(
    effect: TextEffect | string,
    node: HTMLElement,
    index: number,
    getTypeSpeed: () => number,
    easingManager: EasingManager,
    color?: string
  ): Promise<void> {
    return new Promise((resolve) => {
      if (color) {
        node.style.color = color;
      }

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
          this.applyRainbowEffect(node, index, resolve, easingManager);
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
            resolve();
          }
          break;
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

  private applyRainbowEffect(
    node: HTMLElement,
    index: number,
    resolve: () => void,
    easingManager: EasingManager
  ): void {
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
    const animate = (time: number) => {
      const progress = (time % 1000) / 1000; // 1-second loop
      effect(node, progress);
      this.continuousEffects.set(node, window.requestAnimationFrame(animate));
    };
    this.continuousEffects.set(node, window.requestAnimationFrame(animate));
  }

  public stopContinuousEffect(node: HTMLElement): void {
    const animationId = this.continuousEffects.get(node);
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      this.continuousEffects.delete(node);
    }
  }

  public resetEffectStyles(nodes: HTMLElement[], effect: TextEffect): void {
    nodes.forEach((node) => {
      node.style.transition = '';
      node.style.transform = '';
      node.style.opacity = '';
      node.style.visibility = '';
      if (effect !== TextEffect.Rainbow) {
        node.style.color = '';
      }
    });
  }
}
