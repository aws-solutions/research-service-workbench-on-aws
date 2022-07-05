jest.mock('./auditService');
jest.mock('./baseExtractor');
import { NextFunction, Request, Response } from 'express';
import { mockMetadata } from './__mocks__/baseExtractor';
import { AuditConfig, WithAudit } from './auditMiddleware';
import AuditPlugin from './auditPlugin';
import AuditService from './auditService';
import { BaseExtractor } from './baseExtractor';
import Metadata from './metadata';

describe('Audit Middleware', () => {
  const mockRequest: Request = {} as Request;
  const mockResponse: Response = {} as Response;
  const next: NextFunction = jest.fn(() => {
    mockResponse.statusCode = 200;
  });
  const metadata: Metadata = Object.assign(mockMetadata, { statusCode: 200 });

  let auditMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let auditConfig: AuditConfig;
  let auditService: AuditService;
  let mockAuditPlugin: AuditPlugin;
  let excludePaths: string[];

  beforeEach(() => {
    mockAuditPlugin = {
      prepare: jest.fn(),
      write: jest.fn()
    };
    auditService = new AuditService(mockAuditPlugin);
    jest.spyOn(auditService, 'write');

    excludePaths = ['/login'];
    auditConfig = {
      auditService,
      excludePaths
    };
    auditMiddleware = WithAudit(auditConfig);
    metadata.statusCode = 200;
    jest.clearAllMocks();
  });

  test('Skip auditing if url is excluded, ex: /login', async () => {
    const req: Request = {
      path: '/login'
    } as Request;
    const res: Response = {} as Response;

    await auditMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(auditService.write).toBeCalledTimes(0);
  });
  test('Write audit', async () => {
    await auditMiddleware(mockRequest, mockResponse, next);

    expect(BaseExtractor.getMetadata).toBeCalledWith(mockRequest, mockResponse);
    expect(next).toBeCalledTimes(1);

    expect(auditService.write).toBeCalledWith(mockMetadata);
  });
});
