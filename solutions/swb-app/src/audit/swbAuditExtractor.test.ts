/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Extractor } from '@aws/workbench-core-audit';
import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { Request, Response } from 'express';
import SwbAuditExtractor from './swbAuditExtractor';

describe('SwbAuditExtractor', () => {
  let swbAuditExtractor: Extractor;
  beforeEach(() => {
    swbAuditExtractor = new SwbAuditExtractor();
  });
  describe('getMetadata', () => {
    test('with request body', async () => {
      const mockMethod = 'POST';
      const mockUrl = '/sample';
      const mockIp = 'sampleIP';
      const mockUser: AuthenticatedUser = {
        id: 'sampleId',
        roles: []
      };
      const mockBody = { name: 'John' };

      const res: Response = {} as Response;
      res.locals = {
        user: mockUser
      };
      const req: Request = {} as Request;
      req.headers = {
        'x-forwarded-for': mockIp
      };
      req.method = mockMethod;
      req.originalUrl = mockUrl;
      req.body = mockBody;

      const response = swbAuditExtractor.getMetadata(req, res);
      expect(response).toEqual({
        action: `${mockMethod} ${mockUrl}`,
        source: { ip: mockIp },
        actor: { uid: mockUser.id },
        body: mockBody
      });
    });
  });
});
