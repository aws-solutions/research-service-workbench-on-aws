import { AuditEntry, AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import Metadata from '@amzn/workbench-core-audit/lib/metadata';
import { Request, Response, Router } from 'express';
import AuditLogger from '../auditLogger';
import { logger } from '../loggingService';

const writer: Writer = new AuditLogger(logger);
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

const auditService: AuditService = new AuditService(baseAuditPlugin, true);

export const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const auditEntry: AuditEntry = {
    body: { message: 'Hello World' },
    source: {
      ip: req.ip
    }
  };
  const metadata: Metadata = {
    statusCode: res.statusCode,
    action: req.method + ' ' + req.path
  };
  await auditService.write(metadata, auditEntry);
  res.send('Hello World');
});

router.get('/user', async (req: Request, res: Response) => {
  const responsebody: AuditEntry = {
    body: { message: 'Hello User' }
  };
  const metadata: Metadata = {
    statusCode: res.statusCode,
    action: req.method + ' ' + req.path
  };
  await auditService.write(metadata, responsebody);
  res.send('Hello User');
});
