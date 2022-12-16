/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Writer } from '@aws/workbench-core-audit';
import SwbAuditLogger from './swbAuditLogger';

describe('SwbAuditLogger', () => {
  let swbAuditLogger: Writer;
  beforeEach(() => {
    swbAuditLogger = new SwbAuditLogger();
  });
  describe('write', () => {
    test('log auditEntry', async () => {
      // BUILD
      const consoleSpy = jest.spyOn(global.console, 'log');
      const auditEntry = {
        awsRequestId: 'randomAwsRequestId',
        logEventType: 'audit',
        action: 'GET /user',
        actor: { uid: 'sampleID' },
        source: { ip: 'sampleIP' },
        body: { name: 'John' }
      };

      // OPERATE
      await swbAuditLogger.write({}, auditEntry);

      // CHECK
      expect(consoleSpy).toBeCalledWith(auditEntry);
    });
  });
});
