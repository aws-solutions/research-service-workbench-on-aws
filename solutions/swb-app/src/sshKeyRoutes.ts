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
import { isDuplicateKeyError } from './errors/duplicateKeyError';
import { isEc2Error } from './errors/ec2Error';
import { isNoKeyExistsError } from './errors/noKeyExistsError';
import { isNonUniqueKeyError } from './errors/nonUniqueKeyError';
import { CreateSshKeyRequest, CreateSshKeyRequestParser } from './sshKeys/createSshKeyRequest';
import { DeleteSshKeyRequest, DeleteSshKeyRequestParser } from './sshKeys/deleteSshKeyRequest';
import {
  ListUserSshKeysForProjectRequest,
  ListUserSshKeysForProjectRequestParser
} from './sshKeys/listUserSshKeysForProjectRequest';
import { SshKeyPlugin } from './sshKeys/sshKeyPlugin';

export function setUpSshKeyRoutes(router: Router, sshKeyService: SshKeyPlugin): void {
  // List User SSH Keys
  router.get(
    '/projects/:projectId/sshKeys',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedResult = validateAndParse<ListUserSshKeysForProjectRequest>(
        ListUserSshKeysForProjectRequestParser,
        {
          projectId: req.params.projectId,
          userId: res.locals.user.id
        }
      );

      try {
        const response = await sshKeyService.listUserSshKeysForProject(validatedResult);
        res.status(200).send(response);
      } catch (e) {
        console.error(e);
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isEc2Error(e) || isAwsServiceError(e)) {
          throw Boom.badImplementation(e.message);
        }

        throw Boom.badImplementation(
          `There was a problem listing keys in project ${validatedResult.projectId}`
        );
      }
    })
  );
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

  // Create SSH Key
  router.post(
    '/projects/:projectId/sshKeys',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedResult = validateAndParse<CreateSshKeyRequest>(CreateSshKeyRequestParser, {
        projectId: req.params.projectId,
        userId: res.locals.user.id
      });

      try {
        const response = await sshKeyService.createSshKey(validatedResult);
        res.status(201).send(response);
      } catch (e) {
        console.error(e);
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isEc2Error(e) || isAwsServiceError(e)) {
          throw Boom.badImplementation(e.message);
        }

        if (isDuplicateKeyError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(
          `There was a problem creating a SSH Key for user ${validatedResult.userId} and project ${validatedResult.projectId}`
        );
      }
    })
  );
}
