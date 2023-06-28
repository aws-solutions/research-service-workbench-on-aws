/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Writer } from '@aws/workbench-core-audit';
import RswAuditLogger from './rswAuditLogger';

describe('RswAuditLogger', () => {
  let rswAuditLogger: Writer;
  beforeEach(() => {
    rswAuditLogger = new RswAuditLogger();
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
      await rswAuditLogger.write({}, auditEntry);

      // CHECK
      expect(consoleSpy).toBeCalledWith(auditEntry);
    });
  });
});
