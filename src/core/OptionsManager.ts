import { TypecraftOptions, CursorStyle, Direction, TextEffect } from './types';

export class OptionsManager {
  private options: TypecraftOptions;

  constructor(element: string | HTMLElement, options: Partial<TypecraftOptions>) {
    this.validateElement(element);
    this.options = this.initializeOptions(options);
  }

  public getOptions(): TypecraftOptions {
    return this.options;
  }

  private validateElement(element: string | HTMLElement): void {
    if (typeof element === 'string') {
      const el = document.querySelector(element);
      if (!el) {
        throw new Error(`Element with selector "${element}" not found`);
      }
    } else if (!(element instanceof HTMLElement)) {
      throw new Error('Invalid HTML element provided');
    }
  }

  private initializeOptions(options: Partial<TypecraftOptions>): TypecraftOptions {
    const defaultOptions: TypecraftOptions = {
      strings: [],
      speed: 50,
      pauseFor: 1500,
      loop: false,
      autoStart: false,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 500,
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Solid,
        blink: true,
      },
      direction: Direction.LTR,
      textEffect: TextEffect.None,
      easingFunction: (t) => t,
      html: true,
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      cursor: {
        ...defaultOptions.cursor,
        ...options.cursor,
      },
    };

    return mergedOptions;
  }
}
