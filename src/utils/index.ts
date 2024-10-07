import { TextEffect } from '../core/types';

export function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function parseHTML(html: string): Node[] {
  const div = document.createElement('div');
  div.innerHTML = html;
  return Array.from(div.childNodes);
}

export function applyTextEffect(node: Node, effect: TextEffect): void {
  if (node instanceof HTMLElement) {
    switch (effect) {
      case TextEffect.FadeIn:
        node.style.opacity = '0';
        node.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          node.style.opacity = '1';
        }, 50);
        break;
      case TextEffect.SlideIn:
        node.style.transform = 'translateY(20px)';
        node.style.opacity = '0';
        node.style.transition = 'transform 0.5s, opacity 0.5s';
        setTimeout(() => {
          node.style.transform = 'translateY(0)';
          node.style.opacity = '1';
        }, 50);
        break;
    }
  }
}
