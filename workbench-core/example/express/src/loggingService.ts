import { LoggingService } from '@amzn/workbench-core-logging';

export const logger: LoggingService = new LoggingService({
  maxLogLevel: 'info',
  includeLocation: true,
  defaultMetadata: {
    serviceName: 'LoggerService'
  }
});
