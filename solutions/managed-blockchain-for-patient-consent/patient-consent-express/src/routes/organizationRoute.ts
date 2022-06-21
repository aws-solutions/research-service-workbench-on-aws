import { AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import Metadata from '@amzn/workbench-core-audit/lib/metadata';
import express, { Request, Response, Router } from 'express';
import AuditLogger from '../auditLogger';
import { logger } from '../loggingService';

const writer: Writer = new AuditLogger(logger);
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

const auditService: AuditService = new AuditService(baseAuditPlugin, true);
const router: Router = Router();

export default class OrganizationRoute {
  readonly router: Router = express.Router();

  private init() {
    this.router.post('/', async (req: Request, res: Response) => {
      const response = {
        body: 'Hello World'
      };

      this.router.post('/get-org', async (req: Request, res: Response) => {
        const response = {
          body: 'Hello World'
        };
        //orgId
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

      this.router.post('/set-org', async (req: Request, res: Response) => {
        const response = {
          body: 'Hello World'
        };
        //name, url, memberId, publicKey
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
    });
  }
}
