/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { validateAndParse } from '@aws/workbench-core-base';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
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
      await projectEnvTypeConfigService.associateProjectWithEnvTypeConfig(
        req.params.projectId,
        req.params.envTypeId,
        req.params.envTypeConfigId
      );
      res.status(201).send();
    })
  );

  router.delete(
    '/projects/:projectId/environmentTypes/:envTypeId/configurations/:envTypeConfigId/relationships',
    wrapAsync(async (req: Request, res: Response) => {
      await projectEnvTypeConfigService.disassociateProjectAndEnvTypeConfig(
        req.params.projectId,
        req.params.envTypeId,
        req.params.envTypeConfigId
      );
      res.status(204).send();
    })
  );

  router.get(
    '/projects/:projectId/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      const request = validateAndParse<ListProjectEnvTypeConfigsRequest>(
        ListProjectEnvTypeConfigsRequestParser,
        { envTypeId: req.params.envTypeId, projectId: req.params.projectId, ...req.body }
      );
      const relationships = await projectEnvTypeConfigService.listProjectEnvTypeConfigs(request);
      res.status(201).send(relationships);
    })
  );
}
