/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('@vendia/serverless-express', () => ({
  ...jest.requireActual('@vendia/serverless-express'),
  getCurrentInvoke: jest.fn().mockReturnValue({ context: { awsRequestId: 'randomAwsRequestId' } })
}));
import { AuditEntry, AuditPlugin, Metadata, Writer } from '@aws/workbench-core-audit';
import RswAuditPlugin from './rswAuditPlugin';

describe('RswAuditPlugin', () => {
  describe('prepare', () => {
    let rswAuditPlugin: AuditPlugin;
    let writer: Writer;
    let metadata: Metadata;
    let auditEntry: AuditEntry;
    beforeEach(() => {
      rswAuditPlugin = new RswAuditPlugin(writer);
      writer = {
        write: jest.fn(),
        prepare: jest.fn()
      };
      metadata = {
        action: 'GET /user',
        source: { ip: 'sampleIP' },
        actor: { uid: 'sampleID' }
      };
      auditEntry = {};
    });
    describe('update audit entry', () => {
      test('metadata has no body', async () => {
        // OPERATE
        await rswAuditPlugin.prepare(metadata, auditEntry);

        // CHECK
        expect(auditEntry).toEqual({
          awsRequestId: 'randomAwsRequestId',
          logEventType: 'audit',
          ...metadata
        });
      });
      test('metadata has body', async () => {
        // BUILD
        const body = { name: 'John' };
        // OPERATE
        await rswAuditPlugin.prepare({ ...metadata, body }, auditEntry);

        // CHECK
        expect(auditEntry).toEqual({
          awsRequestId: 'randomAwsRequestId',
          logEventType: 'audit',
          ...metadata,
          body
        });
      });
    });
  });
});
