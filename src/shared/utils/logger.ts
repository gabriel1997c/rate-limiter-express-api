import winston from 'winston';

class Logger {
  private static instance: winston.Logger;

  private constructor() {}

  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      const consoleFormat = winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      );

      const fileFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        }),
      );

      Logger.instance = winston.createLogger({
        transports: [
          new winston.transports.Console({
            level: 'debug',
            format: consoleFormat,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            level: 'debug',
            format: fileFormat,
          }),
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat,
          }),
        ],
      });
    }

    return Logger.instance;
  }
}

export const logger = Logger.getInstance();
