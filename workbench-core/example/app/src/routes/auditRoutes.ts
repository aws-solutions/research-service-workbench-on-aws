/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, Metadata, MetadataParser } from '@aws/workbench-core-audit';
import { isAuditIncompleteError } from '@aws/workbench-core-audit/lib/errors/auditIncompleteError';
import { DynamicAuthorizationService } from '@aws/workbench-core-authorization';
import { validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { wrapAuth } from '../utilities/authWrapper';

export function setupAuditRoutes(
  router: Router,
  auditService: AuditService,
  dynamicAuthorizationService: DynamicAuthorizationService
): void {
  router.post(
    '/audit',
    wrapAuth(dynamicAuthorizationService, async (req: Request, res: Response) => {
      try {
        const authenticatedUser = res.locals.user;
        const source = {
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        };
        const statusCode: number = parseInt(req.body.statusCode, 10);
        const metadata = {
          actor: authenticatedUser,
          source,
          action: req.body.action,
          statusCode
        };
        const body = req.body.responseBody;
        const validatedMetadata = validateAndParse<Metadata>(MetadataParser, metadata);
        await auditService.write(validatedMetadata, body);
        res.status(200).send();
      } catch (err) {
        if (isAuditIncompleteError(err)) {
          throw Boom.badRequest(err.message);
        }
        throw err;
      }
    })
  );

  router.get(
    '/audit/is-audit-complete',
    wrapAuth(dynamicAuthorizationService, async (req: Request, res: Response) => {
      const authenticatedUser = res.locals.user;
      const source = {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      };
      const metadata = {
        actor: authenticatedUser,
        source,
        action: req.query.action,
        statusCode: req.query.statusCode ? parseInt(req.query.statusCode as string, 10) : undefined
      };
      const body = req.body.responseBody;
      const validatedMetadata = validateAndParse<Metadata>(MetadataParser, metadata);
      const auditEntry = await auditService.createAuditEntry(validatedMetadata, body);

      const isComplete = auditService.isAuditComplete(auditEntry);
      const response = {
        isComplete
      };
      res.status(200).send(response);
    })
  );
}
