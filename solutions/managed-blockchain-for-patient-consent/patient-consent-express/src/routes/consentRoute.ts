import { AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import Metadata from '@amzn/workbench-core-audit/lib/metadata';
import { Request, Response, Router } from 'express';
import AuditLogger from '../auditLogger';
import { logger } from '../loggingService';

const writer: Writer = new AuditLogger(logger);
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

const auditService: AuditService = new AuditService(baseAuditPlugin, true);

export default class ConsentRoute {
  readonly router: Router = Router();

  private init() {
    this.router.post('/consent', async (req: Request, res: Response) => {
      const response = {
        body: 'Hello World'
      };
      //hashId, source, dest, scope
      const metadata: Metadata = {
        statusCode: res.statusCode,
        action: `${req.method} ${req.path}`,
        source: {
          IP: req.ip
        },
        actor: {
          ID: '9999'
        }
      };

      await auditService.write(metadata, response);
      res.send(response.body);
    });

    this.router.post('/revoke', async (req: Request, res: Response) => {
      const response = {
        body: 'Hello World'
      };
      //hashId, source, dest, scope
      const metadata: Metadata = {
        statusCode: res.statusCode,
        action: `${req.method} ${req.path}`,
        source: {
          IP: req.ip
        },
        actor: {
          ID: '9999'
        }
      };

      await auditService.write(metadata, response);
      res.send(response.body);
    });

    this.router.post('/get-consent', async (req: Request, res: Response) => {
      const response = {
        body: 'Hello World'
      };
      //hashId, source, dest
      const metadata: Metadata = {
        statusCode: res.statusCode,
        action: `${req.method} ${req.path}`,
        source: {
          IP: req.ip
        },
        actor: {
          ID: '9999'
        }
      };

      await auditService.write(metadata, response);
      res.send(response.body);
    });
  }
}
