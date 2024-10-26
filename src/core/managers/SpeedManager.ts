import { SpeedOptions } from '../../types';
import { ErrorSeverity } from '../TypecraftError';
import { ITypecraftLogger } from '../TypecraftLogger';
import {
  SpeedOptionsSchema,
  SpeedOptionsSchemaType,
} from '../../validators/TypecraftOptionsSchema';
import { ErrorHandler } from '../../utils/ErrorHandler';

export interface ISpeedManager {
  setSpeed(speedOptions: Partial<SpeedOptions> | number): void;
  getSpeed(): SpeedOptions;
}

export class SpeedManager implements ISpeedManager {
  private options: SpeedOptionsSchemaType;

  constructor(
    options: SpeedOptionsSchemaType,
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler
  ) {
    this.options = SpeedOptionsSchema.parse(options);
    this.logger.debug('SpeedManager initialized', { initialOptions: options });
  }

  public setSpeed(speedOptions: Partial<SpeedOptionsSchemaType> | number): void {
    try {
      const normalizedOptions = this.normalizeSpeedOptions(speedOptions);
      this.options = SpeedOptionsSchema.parse(normalizedOptions);
      this.logger.debug('Speed options updated', { newSpeedOptions: this.options });
    } catch (error) {
      this.errorHandler.handleError(
        error,
        'Failed to set speed options',
        { speedOptions },
        ErrorSeverity.HIGH
      );
    }
  }

  public getSpeed(): SpeedOptionsSchemaType {
    return this.options;
  }

  private normalizeSpeedOptions(
    speedOptions: Partial<SpeedOptionsSchemaType> | number
  ): SpeedOptionsSchemaType {
    if (typeof speedOptions === 'number') {
      return {
        type: speedOptions,
        delete: speedOptions,
        delay: this.options.delay,
      };
    } else {
      return {
        ...this.options,
        ...speedOptions,
      };
    }
  }
}
