/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser, AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import {
  DEFAULT_API_PAGE_SIZE,
  resourceTypeToKey,
  uuidWithLowercasePrefixRegExp
} from '@aws/workbench-core-base';
import { isDataSetHasEndpointError } from '@aws/workbench-core-datasets';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { toNumber } from 'lodash';
import { CreateDataSetRequest, CreateDataSetRequestParser } from './dataSets/createDataSetRequestParser';
import {
  CreateExternalEndpointRequest,
  CreateExternalEndpointRequestParser
} from './dataSets/createExternalEndpointRequestParser';
import {
  DataSetFileUploadRequest,
  DataSetFileUploadRequestParser
} from './dataSets/DataSetFileUploadRequestParser';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import {
  ListDataSetAccessPermissionsRequest,
  ListDataSetAccessPermissionsRequestParser
} from './dataSets/listDataSetAccessPermissionsRequestParser';
import {
  ProjectAddAccessRequest,
  ProjectAddAccessRequestParser
} from './dataSets/projectAddAccessRequestParser';
import {
  ProjectRemoveAccessRequest,
  ProjectRemoveAccessRequestParser
} from './dataSets/projectRemoveAccessRequestParser';
import { RemoveDataSetRequest, RemoveDataSetRequestParser } from './dataSets/removeDataSetRequestParser';
import { wrapAsync } from './errorHandlers';
import { isConflictError } from './errors/conflictError';
import { validateAndParse } from './validatorHelper';

export function setUpDSRoutes(router: Router, dataSetService: DataSetPlugin): void {
  // creates new prefix in S3 (assumes S3 bucket exist already)
  router.post(
    '/projects/:projectId/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateDataSetRequest>(CreateDataSetRequestParser, req.body);
      const dataSet = await dataSetService.provisionDataSet(req.params.projectId, {
        name: validatedRequest.name,
        storageName: validatedRequest.storageName,
        path: validatedRequest.path,
        awsAccountId: validatedRequest.awsAccountId,
        region: validatedRequest.region,
        storageProvider: dataSetService.storagePlugin,
        type: validatedRequest.type,
        permissions: validatedRequest.permissions,
        authenticatedUser: res.locals.user
      });

      res.status(201).send(dataSet);
    })
  );

  // import new prefix (assumes S3 bucket and path exist already)
  router.post(
    '/projects/:projectsId/datasets/import',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateDataSetRequest>(req.body, CreateDataSetRequestParser);
      const dataSet = await dataSetService.importDataSet({
        name: validatedRequest.name,
        storageName: validatedRequest.storageName,
        path: validatedRequest.path,
        awsAccountId: validatedRequest.awsAccountId,
        region: validatedRequest.region,
        storageProvider: dataSetService.storagePlugin,
        type: validatedRequest.type,
        authenticatedUser: res.locals.user
      });
      res.status(201).send(dataSet);
    })
  );

  // share dataset
  router.post(
    '/projects/:projectsId/datasets/:id/share',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.id.match(uuidWithLowercasePrefixRegExp(resourceTypeToKey.dataset)) === null) {
        throw Boom.badRequest('id request parameter is invalid');
      }
      const validatedRequest = validateAndParse<CreateExternalEndpointRequest>(
        req.body,
        CreateExternalEndpointRequestParser
      );
      await dataSetService.addDataSetExternalEndpoint({
        ...validatedRequest,
        dataSetId: req.params.id,
        authenticatedUser: res.locals.user
      });
      res.status(201).send();
    })
  );

  // Get dataset
  router.get(
    '/projects/:projectsId/datasets/:dataSetId',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.dataSetId.match(uuidWithLowercasePrefixRegExp(resourceTypeToKey.dataset)) === null) {
        throw Boom.badRequest('dataSetId request parameter is invalid');
      }

      const authenticatedUser = validateAndParse<AuthenticatedUser>(AuthenticatedUserParser, res.locals.user);
      const dataset = await dataSetService.getDataSet(req.params.dataSetId, authenticatedUser);
      res.send(dataset);
    })
  );

  // Add file to dataset
  router.get(
    '/projects/:projectsId/datasets/:dataSetId/upload-requests',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.dataSetId.match(uuidWithLowercasePrefixRegExp(resourceTypeToKey.dataset)) === null) {
        throw Boom.badRequest('dataSetId request parameter is invalid');
      }

      const validatedRequest = validateAndParse<DataSetFileUploadRequest>(DataSetFileUploadRequestParser, {
        dataSetId: req.params.dataSetId,
        filenames: req.query.filenames
      });
      const authenticatedUser = validateAndParse<AuthenticatedUser>(AuthenticatedUserParser, res.locals.user);

      if (typeof validatedRequest.filenames === 'string') {
        validatedRequest.filenames = [validatedRequest.filenames];
      }

      const urls = await Promise.all(
        validatedRequest.filenames.map((filename) =>
          dataSetService.getSinglePartFileUploadUrl(validatedRequest.dataSetId, filename, authenticatedUser)
        )
      );

      res.status(200).json({ urls });
    })
  );

  // List dataSets
  router.get(
    '/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      const authenticatedUser = validateAndParse<AuthenticatedUser>(AuthenticatedUserParser, res.locals.user);
      const pageSize = toNumber(req.query.pageSize) || DEFAULT_API_PAGE_SIZE;
      const paginationToken = req.query.paginationToken?.toString();

      const response = await dataSetService.listDataSets(authenticatedUser, pageSize, paginationToken);
      res.send(response);
    })
  );

  router.put(
    '/projects/:projectId/datasets/:datasetId/relationships',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ProjectAddAccessRequest>(ProjectAddAccessRequestParser, {
        authenticatedUser: res.locals.user,
        projectId: req.params.projectId,
        dataSetId: req.params.datasetId,
        accessLevel: req.body.accessLevel
      });

      await dataSetService.addAccessForProject(validatedRequest);

      res.status(204).send();
    })
  );

  router.delete(
    '/projects/:projectId/datasets/:datasetId/relationships',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ProjectRemoveAccessRequest>(
        ProjectRemoveAccessRequestParser,
        {
          authenticatedUser: res.locals.user,
          projectId: req.params.projectId,
          dataSetId: req.params.datasetId
        }
      );

      await dataSetService.removeAccessForProject(validatedRequest);

      res.status(204).send();
    })
  );

  router.get(
    '/datasets/:datasetId/permissions',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListDataSetAccessPermissionsRequest>(
        ListDataSetAccessPermissionsRequestParser,
        {
          ...req.query,
          authenticatedUser: res.locals.user,
          dataSetId: req.params.datasetId
        }
      );
      res.send(await dataSetService.listDataSetAccessPermissions(validatedRequest));
    })
  );

  router.delete(
    '/projects/:projectId/datasets/:datasetId/softDelete',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<RemoveDataSetRequest>(RemoveDataSetRequestParser, {
        authenticatedUser: res.locals.user,
        dataSetId: req.params.datasetId
      });

      try {
        await dataSetService.removeDataSet(validatedRequest.dataSetId, validatedRequest.authenticatedUser);

        res.status(204).send();
      } catch (e) {
        console.error(e);

        if (isConflictError(e)) {
          throw Boom.conflict(e.message);
        }

        if (isDataSetHasEndpointError(e)) {
          throw Boom.conflict(e.message);
        }

        throw Boom.badImplementation(`There was a problem deleting ${req.params.datasetId}`);
      }
    })
  );
}
