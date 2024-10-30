import { TypecraftOptions } from '../../types';
import { ErrorSeverity } from '../error/TypecraftError';
import { ITypecraftLogger } from '../logging/TypecraftLogger';
import {
  TypecraftOptionsSchema,
  TypecraftOptionsSchemaType,
} from '../../validators/TypecraftOptionsSchema';
import { DEFAULT_OPTIONS } from '../../constants';
import { ZodError } from 'zod';
import { ErrorHandler } from '../../utils/ErrorHandler';

export interface IOptionsManager {
  getOptions(): TypecraftOptionsSchemaType;
  updateOptions(newOptions: Partial<TypecraftOptions>): void;
  resetOptions(): void;
}

export class OptionsManager implements IOptionsManager {
  private options: TypecraftOptionsSchemaType;

  constructor(
    element: string | HTMLElement,
    options: Partial<TypecraftOptions>,
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler
  ) {
    this.validateElement(element);
    this.options = this.initializeOptions(options);
    this.logger.debug('OptionsManager initialized', { element, options });
  }

  public getOptions(): TypecraftOptionsSchemaType {
    return this.options;
  }

  private validateElement(element: string | HTMLElement): void {
    if (typeof element === 'string') {
      const el = document.querySelector(element);
      if (!el) {
        this.errorHandler.handleError(
          null,
          `Element with selector "${element}" not found`,
          { selector: element },
          ErrorSeverity.HIGH
        );
      }
    } else if (!(element instanceof HTMLElement)) {
      this.errorHandler.handleError(
        null,
        'Invalid HTML element provided',
        { element },
        ErrorSeverity.HIGH
      );
    }
    this.logger.debug('Element validated successfully', { element });
  }

  private initializeOptions(options: Partial<TypecraftOptions>): TypecraftOptionsSchemaType {
    try {
      const mergedOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        speed: {
          ...DEFAULT_OPTIONS.speed,
          ...options.speed,
        },
        cursor: {
          ...DEFAULT_OPTIONS.cursor,
          ...options.cursor,
        },
        loopLastString: options.loopLastString ?? DEFAULT_OPTIONS.loopLastString,
      };

      return TypecraftOptionsSchema.parse(mergedOptions);
    } catch (error) {
      if (error instanceof ZodError) {
        this.errorHandler.handleError(
          error,
          'Invalid options provided',
          { zodErrors: error.errors },
          ErrorSeverity.HIGH
        );
      }
      throw error;
    }
  }

  public updateOptions(newOptions: Partial<TypecraftOptions>): void {
    try {
      const updatedOptions = {
        ...this.options,
        ...newOptions,
        cursor: {
          ...this.options.cursor,
          ...newOptions.cursor,
        },
        speed: {
          ...this.options.speed,
          ...newOptions.speed,
        },
      };

      this.options = TypecraftOptionsSchema.parse(updatedOptions);
      this.logger.debug('Options updated', { newOptions });
    } catch (error) {
      if (error instanceof ZodError) {
        this.errorHandler.handleError(
          error,
          'Invalid options provided for update',
          { zodErrors: error.errors },
          ErrorSeverity.HIGH
        );
      }
      throw error;
    }
  }

  public resetOptions(): void {
    this.options = TypecraftOptionsSchema.parse(DEFAULT_OPTIONS);
    this.logger.debug('Options reset to default');
  }
}
