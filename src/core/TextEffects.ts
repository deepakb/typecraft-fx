import { TextEffect } from './types';

export class TextEffectManager {
  private currentEffect: TextEffect = TextEffect.None;

  public setEffect(effect: TextEffect): void {
    this.currentEffect = effect;
  }

  public applyEffect(element: HTMLElement, text: string): void {
    switch (this.currentEffect) {
      case TextEffect.FadeIn:
        this.applyFadeInEffect(element, text);
        break;
      case TextEffect.SlideIn:
        this.applySlideInEffect(element, text);
        break;
      default:
        element.textContent += text;
    }
  }

  private applyFadeInEffect(element: HTMLElement, text: string): void {
    const span = document.createElement('span');
    span.textContent = text;
    span.style.opacity = '0';
    element.appendChild(span);

    requestAnimationFrame(() => {
      span.style.transition = 'opacity 0.1s ease-in-out';
      span.style.opacity = '1';
    });
  }

  private applySlideInEffect(element: HTMLElement, text: string): void {
    const span = document.createElement('span');
    span.textContent = text;
    span.style.transform = 'translateY(20px)';
    span.style.opacity = '0';
    element.appendChild(span);

    requestAnimationFrame(() => {
      span.style.transition = 'transform 0.3s, opacity 0.3s';
      span.style.transform = 'translateY(0)';
      span.style.opacity = '1';
    });
  }
}
