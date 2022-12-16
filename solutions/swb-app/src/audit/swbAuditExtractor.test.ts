import { Extractor } from '@aws/workbench-core-audit';
import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { Request, Response } from 'express';
import SwbAuditExtractor from './swbAuditExtractor';

describe('SwbAuditExtractor', () => {
  let swbAuditExtractor: Extractor;
  const mockMethod = 'POST';
  const mockUrl = '/sample';
  const mockIp = 'sampleIP';
  const mockUser: AuthenticatedUser = {
    id: 'sampleId',
    roles: []
  };
  const mockBody = { name: 'John' };
  beforeEach(() => {
    swbAuditExtractor = new SwbAuditExtractor();
  });
  describe('getMetadata', () => {
    test('with request body', async () => {
      const res: Response = {
        locals: {
          user: mockUser
        }
      } as unknown as Response;
      const req: Request = {
        headers: {
          'x-forwarded-for': mockIp
        },
        method: mockMethod,
        originalUrl: mockUrl,
        body: mockBody
      } as unknown as Request;
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
