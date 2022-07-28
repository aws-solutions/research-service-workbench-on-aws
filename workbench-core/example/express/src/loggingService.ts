/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingService } from '@amzn/workbench-core-logging';

export const logger: LoggingService = new LoggingService({
  maxLogLevel: 'debug',
  includeLocation: true,
  defaultMetadata: {
    serviceName: 'LoggerService',
    app: 'Sample Express App'
  }
});
