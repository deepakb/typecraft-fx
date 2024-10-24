import { TypecraftOptions, CursorStyle, Direction, TextEffect } from './types';
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { logger } from './TypecraftLogger';

export class OptionsManager {
  private options: TypecraftOptions;

  constructor(element: string | HTMLElement, options: Partial<TypecraftOptions>) {
    this.validateElement(element);
    this.options = this.initializeOptions(options);
    logger.debug('OptionsManager initialized', { element, options });
  }

  public getOptions(): TypecraftOptions {
    return this.options;
  }

  private validateElement(element: string | HTMLElement): void {
    if (typeof element === 'string') {
      const el = document.querySelector(element);
      if (!el) {
        throw new TypecraftError(
          ErrorCode.INVALID_ELEMENT,
          `Element with selector "${element}" not found`,
          ErrorSeverity.HIGH,
          { selector: element }
        );
      }
    } else if (!(element instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_ELEMENT,
        'Invalid HTML element provided',
        ErrorSeverity.HIGH,
        { element }
      );
    }
    logger.debug('Element validated successfully', { element });
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

    // Validate input options
    this.validateOptions(options);

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      cursor: {
        ...defaultOptions.cursor,
        ...options.cursor,
      },
    };

    logger.debug('Options initialized', { mergedOptions });
    return mergedOptions;
  }

  private validateOptions(options: Partial<TypecraftOptions>): void {
    if (options.speed !== undefined) {
      if (typeof options.speed === 'number') {
        if (options.speed <= 0) {
          throw new TypecraftError(
            ErrorCode.INVALID_OPTION,
            'Speed must be a positive number',
            ErrorSeverity.HIGH,
            { speed: options.speed }
          );
        }
      } else if (typeof options.speed === 'object') {
        const { type, delete: deleteSpeed, delay } = options.speed;
        if (type !== undefined && (typeof type !== 'number' || type <= 0)) {
          throw new TypecraftError(
            ErrorCode.INVALID_OPTION,
            'Type speed must be a positive number',
            ErrorSeverity.HIGH,
            { typeSpeed: type }
          );
        }
        if (deleteSpeed !== undefined && (typeof deleteSpeed !== 'number' || deleteSpeed <= 0)) {
          throw new TypecraftError(
            ErrorCode.INVALID_OPTION,
            'Delete speed must be a positive number',
            ErrorSeverity.HIGH,
            { deleteSpeed }
          );
        }
        if (delay !== undefined && (typeof delay !== 'number' || delay < 0)) {
          throw new TypecraftError(
            ErrorCode.INVALID_OPTION,
            'Delay must be a non-negative number',
            ErrorSeverity.HIGH,
            { delay }
          );
        }
      } else {
        throw new TypecraftError(
          ErrorCode.INVALID_OPTION,
          'Speed must be a number or an object with type, delete, and delay properties',
          ErrorSeverity.HIGH,
          { speed: options.speed }
        );
      }
    }

    // Keep the existing validations for other options
    if (
      options.pauseFor !== undefined &&
      (typeof options.pauseFor !== 'number' || options.pauseFor < 0)
    ) {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTION,
        'PauseFor must be a non-negative number',
        ErrorSeverity.HIGH,
        { pauseFor: options.pauseFor }
      );
    }

    if (options.loop !== undefined && typeof options.loop !== 'boolean') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTION,
        'Loop must be a boolean',
        ErrorSeverity.HIGH,
        { loop: options.loop }
      );
    }

    // Add more validations for other options as needed
    logger.debug('Options validated successfully', { options });
  }

  public updateOptions(newOptions: Partial<TypecraftOptions>): void {
    this.validateOptions(newOptions);
    this.options = {
      ...this.options,
      ...newOptions,
      cursor: {
        ...this.options.cursor,
        ...newOptions.cursor,
      },
    };
    logger.debug('Options updated', { newOptions });
  }

  public resetOptions(): void {
    this.options = this.initializeOptions({});
    logger.debug('Options reset to default');
  }
}
