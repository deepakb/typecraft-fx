import { SpeedOptions, TypecraftOptions } from './types';
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { logger } from './TypecraftLogger';

export class SpeedManager {
  private options: TypecraftOptions;

  constructor(options: TypecraftOptions) {
    this.options = options;
    logger.debug('SpeedManager initialized', { initialOptions: options });
  }

  public setSpeed(speedOptions: Partial<SpeedOptions> | number): void {
    try {
      if (typeof speedOptions === 'number') {
        this.options.speed = {
          type: speedOptions,
          delete: speedOptions,
          delay: 1500,
        };
      } else {
        if (typeof this.options.speed !== 'object') {
          this.options.speed = {
            type: this.options.speed as number,
            delete: this.options.speed as number,
            delay: 1500,
          };
        }

        const defaultSpeed = 50;
        const defaultDelay = 1500;

        this.options.speed = {
          type: speedOptions.type ?? this.options.speed.type ?? defaultSpeed,
          delete: speedOptions.delete ?? this.options.speed.delete ?? defaultSpeed,
          delay: speedOptions.delay ?? this.options.speed.delay ?? defaultDelay,
        };
      }
      logger.debug('Speed options updated', { newSpeedOptions: this.options.speed });
    } catch (error) {
      throw new TypecraftError(
        ErrorCode.RUNTIME_ERROR,
        'Failed to set speed options',
        ErrorSeverity.HIGH,
        { error, speedOptions }
      );
    }
  }

  public getSpeed(): SpeedOptions {
    try {
      if (typeof this.options.speed === 'object') {
        logger.debug('Speed options retrieved', { speed: this.options.speed });
        return this.options.speed;
      } else {
        logger.warn('Invalid speed type, using default speed options');
        return { type: 50, delete: 50, delay: 1500 };
      }
    } catch (error) {
      throw new TypecraftError(
        ErrorCode.RUNTIME_ERROR,
        'Failed to get speed options',
        ErrorSeverity.HIGH,
        { error }
      );
    }
  }
}
