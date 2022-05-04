import { LoggingService } from '@amzn/workbench-core-logging';

export const logger: LoggingService = new LoggingService({
  maxLogLevel: 'error',
  includeLocation: true,
  defaultMetadata: {
    serviceName: 'LoggerService',
    app: 'Sample Express App'
  }
});
