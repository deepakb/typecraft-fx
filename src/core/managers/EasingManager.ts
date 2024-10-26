import { z } from 'zod';
import { ErrorSeverity } from '../TypecraftError';
import { ITypecraftLogger } from '../TypecraftLogger';
import { ErrorHandler } from '../../utils/ErrorHandler';

const EasingFunctionSchema = z.function().args(z.number()).returns(z.number());

const EasingOptionsSchema = z.object({
  easingFunction: EasingFunctionSchema,
});

type EasingOptionsSchemaType = z.infer<typeof EasingOptionsSchema>;

export interface IEasingManager {
  getEasing(): (t: number) => number;
  setEasingFunction(easingFunction: (t: number) => number): void;
  applyEasing(value: number): number;
}

export class EasingManager implements IEasingManager {
  private options: EasingOptionsSchemaType;
  private defaultEasing: (t: number) => number = (t: number) => t;

  constructor(
    options: EasingOptionsSchemaType,
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler
  ) {
    this.options = EasingOptionsSchema.parse(options);
    this.logger.debug('EasingManager initialized', { options });
  }

  public getEasing(): (t: number) => number {
    return this.options.easingFunction || this.defaultEasing;
  }

  public setEasingFunction(easingFunction: (t: number) => number): void {
    this.options = EasingOptionsSchema.parse({ easingFunction });
    this.logger.info('Easing function set successfully');
  }

  public applyEasing(value: number): number {
    try {
      const result = this.getEasing()(value);
      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Error applying easing', { value }, ErrorSeverity.HIGH);
    }
  }
}
