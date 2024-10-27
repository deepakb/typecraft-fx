export enum ErrorCode {
  INVALID_ELEMENT = 'INVALID_ELEMENT',
  INVALID_OPTIONS = 'INVALID_OPTIONS',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_OPTION = 'INVALID_OPTION',
  QUEUE_EXECUTION_ERROR = 'QUEUE_EXECUTION_ERROR',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ITypecraftError {
  readonly code: ErrorCode;
  readonly severity: ErrorSeverity;
  readonly details?: Record<string, any>;
  readonly timestamp: Date;
  toJSON(): Record<string, any>;
  toString(): string;
}

export class TypecraftError extends Error implements ITypecraftError {
  public readonly timestamp: Date;

  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TypecraftError';
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TypecraftError);
    }

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TypecraftError.prototype);
  }

  static create(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: Record<string, any>
  ): TypecraftError {
    return new TypecraftError(code, message, severity, details);
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
    };
  }

  public toString(): string {
    return `[${this.severity}] ${this.name} (${this.code}): ${this.message}`;
  }
}
