import { EasingManager } from './EasingManager';
import { TextEffect } from './types';

export class EffectManager {
  public async applyTextEffect(
    effect: TextEffect,
    node: HTMLElement,
    index: number,
    getTypeSpeed: () => number,
    easingManager: EasingManager
  ): Promise<void> {
    return new Promise((resolve) => {
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
        case TextEffect.None:
        default:
          resolve();
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
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
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
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    setTimeout(() => requestAnimationFrame(animate), index * 20);
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
        requestAnimationFrame(animate);
      } else {
        node.textContent = originalChar;
        resolve();
      }
    };

    setTimeout(() => requestAnimationFrame(animate), index * 25);
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
    node.style.color = colors[index % colors.length];
    node.style.opacity = '0';
    const duration = 100; // 0.1s in milliseconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easingManager.applyEasing(progress);

      node.style.opacity = easedProgress.toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    setTimeout(() => requestAnimationFrame(animate), index * 20);
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
