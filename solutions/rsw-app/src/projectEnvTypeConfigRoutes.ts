/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { isInvalidPaginationTokenError, validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import { isConflictError } from './errors/conflictError';
import { isProjectDeletedError } from './errors/projectDeletedError';
import {
  AssociateProjectEnvTypeConfigRequest,
  AssociateProjectEnvTypeConfigRequestParser
} from './projectEnvTypeConfigs/associateProjectEnvTypeConfigRequest';
import {
  DisassociateProjectEnvTypeConfigRequest,
  DisassociateProjectEnvTypeConfigRequestParser
} from './projectEnvTypeConfigs/disassociateProjectEnvTypeConfigRequest';
import {
  GetProjectEnvTypeConfigRequest,
  GetProjectEnvTypeConfigRequestParser
} from './projectEnvTypeConfigs/getProjectEnvTypeConfigRequest';
import {
  ListEnvTypeConfigProjectsRequest,
  ListEnvTypeConfigProjectsRequestParser
} from './projectEnvTypeConfigs/listEnvTypeConfigProjectsRequest';
import {
  ListProjectEnvTypeConfigsRequest,
  ListProjectEnvTypeConfigsRequestParser
} from './projectEnvTypeConfigs/listProjectEnvTypeConfigsRequest';
import { ProjectEnvTypeConfigPlugin } from './projectEnvTypeConfigs/projectEnvTypeConfigPlugin';

export function setUpProjectEnvTypeConfigRoutes(
  router: Router,
  projectEnvTypeConfigService: ProjectEnvTypeConfigPlugin
): void {
  // creates new prefix in S3 (assumes S3 bucket exist already)
  router.put(
    '/projects/:projectId/environmentTypes/:envTypeId/configurations/:envTypeConfigId/relationships',
    wrapAsync(async (req: Request, res: Response) => {
      const request = validateAndParse<AssociateProjectEnvTypeConfigRequest>(
        AssociateProjectEnvTypeConfigRequestParser,
        {
          projectId: req.params.projectId,
          envTypeId: req.params.envTypeId,
          envTypeConfigId: req.params.envTypeConfigId,
          user: res.locals.user
        }
      );
      try {
        await projectEnvTypeConfigService.associateProjectWithEnvTypeConfig(request);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }
        if (isProjectDeletedError(e)) {
          throw Boom.badRequest(e.message);
        }
        console.error(e);
        throw Boom.badImplementation(`There was a problem associating project with etc`);
      }
      res.status(204).send();
    })
  );

  router.delete(
    '/projects/:projectId/environmentTypes/:envTypeId/configurations/:envTypeConfigId/relationships',
    wrapAsync(async (req: Request, res: Response) => {
      const request = validateAndParse<DisassociateProjectEnvTypeConfigRequest>(
        DisassociateProjectEnvTypeConfigRequestParser,
        {
          projectId: req.params.projectId,
          envTypeId: req.params.envTypeId,
          envTypeConfigId: req.params.envTypeConfigId,
          user: res.locals.user
        }
      );
      try {
        await projectEnvTypeConfigService.disassociateProjectAndEnvTypeConfig(request);
        res.status(204).send();
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }
        if (isConflictError(e)) {
          throw Boom.conflict(e.message);
        }
        console.error(e);
        throw Boom.badImplementation(`There was a problem disassociating project with etc`);
      }
    })
  );

  router.get(
    '/projects/:projectId/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      const request = validateAndParse<ListProjectEnvTypeConfigsRequest>(
        ListProjectEnvTypeConfigsRequestParser,
        { envTypeId: req.params.envTypeId, projectId: req.params.projectId, ...req.query }
      );
      try {
        const relationships = await projectEnvTypeConfigService.listProjectEnvTypeConfigs(request);
        res.status(200).send(relationships);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        console.error(e);
        throw Boom.badImplementation(`There was a problem list ETCs associated with project`);
      }
    })
  );

  router.get(
    '/projects/:projectId/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      const request = validateAndParse<GetProjectEnvTypeConfigRequest>(GetProjectEnvTypeConfigRequestParser, {
        envTypeId: req.params.envTypeId,
        projectId: req.params.projectId,
        envTypeConfigId: req.params.envTypeConfigId
      });
      const relationship = await projectEnvTypeConfigService.getEnvTypeConfig(request);

      if (!relationship) {
        throw Boom.notFound('Resource not found');
      }

      res.status(200).send(relationship);
    })
  );

  router.get(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId/projects',
    wrapAsync(async (req: Request, res: Response) => {
      const request = validateAndParse<ListEnvTypeConfigProjectsRequest>(
        ListEnvTypeConfigProjectsRequestParser,
        { envTypeId: req.params.envTypeId, envTypeConfigId: req.params.envTypeConfigId, ...req.query }
      );

      try {
        const relationships = await projectEnvTypeConfigService.listEnvTypeConfigProjects(request);
        res.status(200).send(relationships);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(
          `There was a problem listing projects for environment type configuration`
        );
      }
    })
  );
}
