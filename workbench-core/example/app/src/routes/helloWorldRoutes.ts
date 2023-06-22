/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin, Writer } from '@aws/workbench-core-audit';
import Metadata from '@aws/workbench-core-audit/lib/metadata';
import { Request, Response, Router } from 'express';
import { AuditLogger, logger } from '../services';

const writer: Writer = new AuditLogger(logger);
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

const auditService: AuditService = new AuditService(baseAuditPlugin, true);

export function setupHelloWorldRoutes(router: Router): void {
  router.get('/hello-world', async (req: Request, res: Response) => {
    const response = {
      body: 'Hello World'
    };

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
    res.status(200).send(response.body);
  });
}
