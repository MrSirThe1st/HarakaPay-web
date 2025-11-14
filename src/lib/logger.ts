// Production-safe logger utility
// Only logs in development, silent in production

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private log(level: LogLevel, ...args: unknown[]): void {
    if (!isDevelopment && level !== 'error') {
      // In production, only log errors
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'debug':
        console.debug(prefix, ...args);
        break;
      default:
        console.log(prefix, ...args);
    }
  }

  public info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  public warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  public error(...args: unknown[]): void {
    this.log('error', ...args);
  }

  public debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }
}

export const logger = new Logger();
