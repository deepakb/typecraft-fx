import { TextEffect } from './types';

export class TextEffectManager {
  public async applyTextEffect(
    effect: TextEffect,
    node: HTMLElement,
    index: number,
    getTypeSpeed: () => number
  ): Promise<void> {
    return new Promise((resolve) => {
      switch (effect) {
        case TextEffect.FadeIn:
          this.applyFadeInEffect(node, resolve);
          break;
        case TextEffect.SlideIn:
          this.applySlideInEffect(node, index, resolve);
          break;
        case TextEffect.Glitch:
          this.applyGlitchEffect(node, index, resolve);
          break;
        case TextEffect.Typecraft:
          this.applyTypecraftEffect(node, index, getTypeSpeed, resolve);
          break;
        case TextEffect.Rainbow:
          this.applyRainbowEffect(node, index, resolve);
          break;
        case TextEffect.None:
        default:
          resolve();
          break;
      }
    });
  }

  private applyFadeInEffect(node: HTMLElement, resolve: () => void): void {
    node.style.opacity = '0';
    node.style.transition = 'opacity 0.1s ease-in-out';
    requestAnimationFrame(() => {
      node.style.opacity = '1';
      resolve();
    });
  }

  private applySlideInEffect(node: HTMLElement, index: number, resolve: () => void): void {
    node.style.transform = 'translateY(20px)';
    node.style.opacity = '0';
    node.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
    setTimeout(() => {
      node.style.transform = 'translateY(0)';
      node.style.opacity = '1';
      setTimeout(resolve, 200);
    }, index * 20);
  }

  private applyGlitchEffect(node: HTMLElement, index: number, resolve: () => void): void {
    const glitchChars = '!@#$%^&*()_+-={}[]|;:,.<>?';
    const originalChar = node.textContent || '';
    let glitchInterval: number;
    setTimeout(() => {
      glitchInterval = window.setInterval(() => {
        node.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }, 50);
      setTimeout(() => {
        clearInterval(glitchInterval);
        node.textContent = originalChar;
        resolve();
      }, 200);
    }, index * 50);
  }

  private applyTypecraftEffect(
    node: HTMLElement,
    index: number,
    getTypeSpeed: () => number,
    resolve: () => void
  ): void {
    node.style.visibility = 'hidden';
    setTimeout(() => {
      node.style.visibility = 'visible';
      resolve();
    }, index * getTypeSpeed());
  }

  private applyRainbowEffect(node: HTMLElement, index: number, resolve: () => void): void {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    node.style.color = colors[index % colors.length];
    node.style.opacity = '0';
    node.style.transition = 'opacity 0.1s ease-in-out';
    setTimeout(() => {
      node.style.opacity = '1';
      setTimeout(resolve, 100);
    }, index * 20);
  }

  public resetEffectStyles(nodes: HTMLElement[], effect: TextEffect): void {
    nodes.forEach((element) => {
      element.style.removeProperty('transition');
      element.style.removeProperty('transform');
      element.style.removeProperty('opacity');
      element.style.removeProperty('visibility');
      if (effect !== TextEffect.Rainbow) {
        element.style.removeProperty('color');
      }
    });
  }
}
