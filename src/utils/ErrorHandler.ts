import { TypecraftError, ErrorCode, ErrorSeverity } from '../core/TypecraftError';
import { ITypecraftLogger } from '../core/TypecraftLogger';

export class ErrorHandler {
  constructor(private logger: ITypecraftLogger) {}

  handleError(
    error: unknown,
    message: string,
    context: object = {},
    severity: ErrorSeverity = ErrorSeverity.HIGH
  ): never {
    if (error instanceof TypecraftError) {
      this.logger.error(error.code, message, { error, context });
      throw error;
    } else {
      const typecraftError = new TypecraftError(ErrorCode.RUNTIME_ERROR, message, severity, {
        originalError: error,
        ...context,
      });
      this.logger.error(typecraftError.code, message, { error: typecraftError, context });
      throw typecraftError;
    }
  }
}
