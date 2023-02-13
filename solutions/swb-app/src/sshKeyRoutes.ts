/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { isForbiddenError } from '@aws/workbench-core-authorization';
import { validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import { isAwsServiceError } from './errors/awsServiceError';
import { isEc2Error } from './errors/ec2Error';
import { isNoKeyExistsError } from './errors/noKeyExistsError';
import { isNonUniqueKeyError } from './errors/nonUniqueKeyError';
import { DeleteSshKeyRequest, DeleteSshKeyRequestParser } from './sshKeys/deleteSshKeyRequest';
import { SshKeyPlugin } from './sshKeys/sshKeyPlugin';

export function setUpSshKeyRoutes(router: Router, sshKeyService: SshKeyPlugin): void {
  // Delete SSH Key
  router.delete(
    '/projects/:projectId/sshKeys/:sshKeyId',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedResult = validateAndParse<DeleteSshKeyRequest>(DeleteSshKeyRequestParser, {
        currentUserId: res.locals.user.id,
        sshKeyId: req.params.sshKeyId,
        projectId: req.params.projectId
      });

      try {
        await sshKeyService.deleteSshKey(validatedResult);
        res.status(204).send();
      } catch (e) {
        console.error(e);
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isNoKeyExistsError(e)) {
          throw Boom.notFound(e.message);
        }

        if (isEc2Error(e) || isAwsServiceError(e) || isNonUniqueKeyError(e)) {
          throw Boom.badImplementation(e.message);
        }

        if (isForbiddenError(e)) {
          throw Boom.forbidden(e.message);
        }

        throw Boom.badImplementation(`There was a problem deleting ${validatedResult.sshKeyId}`);
      }
    })
  );
}
