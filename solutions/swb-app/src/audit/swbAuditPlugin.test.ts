/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('@vendia/serverless-express', () => ({
  ...jest.requireActual('@vendia/serverless-express'),
  getCurrentInvoke: jest.fn().mockReturnValue({ context: { awsRequestId: 'randomAwsRequestId' } })
}));
import { AuditEntry, AuditPlugin, Metadata, Writer } from '@aws/workbench-core-audit';
import SwbAuditPlugin from './swbAuditPlugin';

describe('SwbAuditPlugin', () => {
  describe('prepare', () => {
    let swbAuditPlugin: AuditPlugin;
    let writer: Writer;
    let metadata: Metadata;
    let auditEntry: AuditEntry;
    beforeEach(() => {
      swbAuditPlugin = new SwbAuditPlugin(writer);
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
        await swbAuditPlugin.prepare(metadata, auditEntry);

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
        await swbAuditPlugin.prepare({ ...metadata, body }, auditEntry);

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
