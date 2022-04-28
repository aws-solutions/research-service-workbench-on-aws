import { AuditEntry, AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import Metadata from '@amzn/workbench-core-audit/lib/metadata';
import { LoggingService } from '@amzn/workbench-core-logging';
import express, { Request, Response, Router } from 'express';
import { AuditLogger } from '../auditLogger';

const logger: LoggingService = new LoggingService({
  maxLogLevel: 'info',
  includeLocation: true,
  defaultMetadata: {
    serviceName: 'express'
  }
});

const writer: Writer = new AuditLogger(logger);
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

const auditService: AuditService = new AuditService(baseAuditPlugin, true);

export const router: Router = express.Router();

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
  await auditService
    .write(metadata, auditEntry)
    .then(() => {
      console.log('Success');
    })
    .catch((error) => {
      console.error(error);
    });
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
  await auditService
    .write(metadata, responsebody)
    .then(() => {
      console.log('Success');
    })
    .catch((error) => {
      console.error(error);
    });
  res.send('Hello User');
});
