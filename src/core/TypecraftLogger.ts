/* eslint-disable no-console */
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { ErrorHandler } from '../utils/ErrorHandler';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export interface ILogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface ITypecraftLogger {
  setLogLevel(level: LogLevel): void;
  error(code: ErrorCode, message: string, details?: Record<string, any>): void;
  warn(message: string, details?: Record<string, any>): void;
  info(message: string, details?: Record<string, any>): void;
  debug(message: string, details?: Record<string, any>): void;
  getLogEntries(): ILogEntry[];
  clearLogs(): void;
}

export class TypecraftLogger implements ITypecraftLogger {
  private static instance: TypecraftLogger;
  private logEntries: ILogEntry[] = [];
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  public static getInstance(): TypecraftLogger {
    if (!TypecraftLogger.instance) {
      TypecraftLogger.instance = new TypecraftLogger();
    }
    return TypecraftLogger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    if (!Object.values(LogLevel).includes(level)) {
      this.handleError(new Error('Invalid log level'), 'Invalid log level provided', { level });
    }
    this.logLevel = level;
  }

  public error(code: ErrorCode, message: string, details?: Record<string, any>): void {
    const error = TypecraftError.create(code, message, ErrorSeverity.HIGH, details);
    this.log(LogLevel.ERROR, error.toString(), details);
    throw error;
  }

  public warn(message: string, details?: Record<string, any>): void {
    this.log(LogLevel.WARN, `⚠️ TypecraftFX Warning: ${message}`, details);
  }

  public info(message: string, details?: Record<string, any>): void {
    this.log(LogLevel.INFO, `ℹ️ TypecraftFX Info: ${message}`, details);
  }

  public debug(message: string, details?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, `🔍 TypecraftFX Debug: ${message}`, details);
  }

  public getLogEntries(): ILogEntry[] {
    return [...this.logEntries];
  }

  public clearLogs(): void {
    this.logEntries = [];
  }

  private log(level: LogLevel, message: string, details?: Record<string, any>): void {
    if (this.shouldLog(level)) {
      const entry: ILogEntry = {
        level,
        message,
        timestamp: new Date(),
        details,
      };
      this.logEntries.push(entry);
      this.writeToConsole(entry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private writeToConsole(entry: ILogEntry): void {
    const { level, message, timestamp, details } = entry;
    const formattedMessage = `[${timestamp.toISOString()}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, details);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, details);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, details);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage, details);
        break;
    }
  }

  private handleError(
    error: unknown,
    message: string,
    context: object = {},
    severity: ErrorSeverity = ErrorSeverity.HIGH
  ): never {
    ErrorHandler.handleError(error, message, context, severity);
  }
}

export const logger = TypecraftLogger.getInstance();
