/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import { isDatabaseError } from './errors/databaseError';
import { isNoKeyExistsError } from './errors/noKeyExistsError';
import { isNonUniqueKeyError } from './errors/nonUniqueKeyError';
import { DeleteKeyPairRequest, DeleteKeyPairRequestParser } from './keyPairs/deleteKeyPairRequest';
import { GetKeyPairRequest, GetKeyPairRequestParser } from './keyPairs/getKeyPairRequest';
import { KeyPairPlugin } from './keyPairs/keyPairPlugin';

export function setUpKeyPairRoutes(router: Router, keyPairService: KeyPairPlugin): void {
  // Get key pair
  router.get(
    '/projects/:projectId/sshKeys',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const validatedRequest = validateAndParse<GetKeyPairRequest>(GetKeyPairRequestParser, {
          projectId: req.params.projectId,
          userId: res.locals.user.id
        });

        res.status(200).send(await keyPairService.getKeyPair(validatedRequest));
      } catch (e) {
        if (isDatabaseError(e)) {
          throw Boom.badImplementation(e.message);
        }
        if (isNoKeyExistsError(e)) {
          throw Boom.notFound(e.message);
        }
        if (isNonUniqueKeyError(e)) {
          throw Boom.badRequest(e.message);
        }
        throw Boom.badImplementation(e.message);
      }
    })
  );

  // Delete key pair
  router.delete(
    '/projects/:projectId/sshKeys',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const validatedRequest = validateAndParse<DeleteKeyPairRequest>(DeleteKeyPairRequestParser, {
          projectId: req.params.projectId,
          userId: res.locals.user.id
        });

        await keyPairService.deleteKeyPair(validatedRequest);

        res.status(204).send();
      } catch (e) {
        if (isDatabaseError(e)) {
          throw Boom.badImplementation(e.message);
        }
        if (isNoKeyExistsError(e)) {
          throw Boom.notFound(e.message);
        }
        if (isNonUniqueKeyError(e)) {
          throw Boom.badRequest(e.message);
        }
        throw Boom.badImplementation(e.message);
      }
    })
  );
}
