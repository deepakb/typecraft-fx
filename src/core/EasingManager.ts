import { EasingFunction, TypecraftOptions } from './types';
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { logger } from './TypecraftLogger';

export class EasingManager {
  private options: TypecraftOptions;
  private defaultEasing: EasingFunction = (t: number) => t;

  constructor(options: TypecraftOptions) {
    this.options = options;
  }

  public getEasing(): EasingFunction {
    return this.options.easingFunction || this.defaultEasing;
  }

  public setEasingFunction(easingFunction: EasingFunction): void {
    if (typeof easingFunction !== 'function') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid easing function',
        ErrorSeverity.HIGH,
        {
          easingFunction,
        }
      );
    }
    this.options.easingFunction = easingFunction;
    logger.info('Easing function set successfully');
  }

  public applyEasing(value: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new TypecraftError(ErrorCode.INVALID_INPUT, 'Invalid input value', ErrorSeverity.HIGH, {
        value,
      });
    }
    try {
      return this.getEasing()(value);
    } catch (error) {
      throw new TypecraftError(
        ErrorCode.RUNTIME_ERROR,
        'Error applying easing',
        ErrorSeverity.HIGH,
        {
          originalError: error,
        }
      );
    }
  }
}
