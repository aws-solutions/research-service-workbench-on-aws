/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import Metadata from '@amzn/workbench-core-audit/lib/metadata';
import { Request, Response, Router } from 'express';
import AuditLogger from '../auditLogger';
import { logger } from '../loggingService';

const writer: Writer = new AuditLogger(logger);
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

const auditService: AuditService = new AuditService(baseAuditPlugin, true);

export const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
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
  res.send(response.body);
});

router.get('/:model/:id', async (req: Request, res: Response) => {
  const response = {
    body: 'Hello ' + req.params.model
  };

  const metadata: Metadata = {
    statusCode: res.statusCode,
    action: `${req.method} ${req.path}`,
    source: {
      IP: req.ip
    },
    actor: {
      ID: req.params.id
    }
  };

  await auditService.write(metadata, response);
  res.send(response.body);
});
