/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingService } from '@aws/workbench-core-logging';
import AuditLogger from './auditLogger';

describe('Audit Logger', () => {
  let auditLogger: AuditLogger;
  let logger: LoggingService;
  beforeEach(() => {
    logger = new LoggingService();
    auditLogger = new AuditLogger(logger);
  });

  test('write audit entry', async () => {
    expect(async () => await auditLogger.write({}, { actor: { userId: 'userId' } })).not.toThrow();
  });
});
