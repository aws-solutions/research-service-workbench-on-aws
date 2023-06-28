/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser, AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import {
  DEFAULT_API_PAGE_SIZE,
  resourceTypeToKey,
  uuidWithLowercasePrefixRegExp,
  isInvalidPaginationTokenError
} from '@aws/workbench-core-base';
import {
  isDataSetHasEndpointError,
  isDataSetExistsError,
  isDataSetInvalidParameterError,
  isStorageNotFoundError,
  isAccountNotFoundError,
  isDataSetNotFoundError
} from '@aws/workbench-core-datasets';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { CreateDataSetRequest, CreateDataSetRequestParser } from './dataSets/createDataSetRequestParser';
import {
  DataSetFileUploadRequest,
  DataSetFileUploadRequestParser
} from './dataSets/DataSetFileUploadRequestParser';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import {
  GetDataSetByProjectRequest,
  GetDataSetByProjectRequestParser
} from './dataSets/getDataSetByProjectRequestParser';
import { GetDataSetRequest, GetDataSetRequestParser } from './dataSets/getDataSetRequestParser';
import {
  ListDataSetAccessPermissionsRequest,
  ListDataSetAccessPermissionsRequestParser
} from './dataSets/listDataSetAccessPermissionsRequestParser';
import { ListDataSetRequest, ListDataSetRequestParser } from './dataSets/listDataSetRequestParser';
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
      try {
        const dataSet = await dataSetService.provisionDataSet(req.params.projectId, {
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
      } catch (e) {
        if (isDataSetExistsError(e)) {
          throw Boom.conflict(e.message);
        }
        if (isDataSetInvalidParameterError(e) || isAccountNotFoundError(e) || isStorageNotFoundError(e)) {
          throw Boom.badRequest(e.message);
        }
        console.error(e);
        throw Boom.badImplementation(`There was a problem creating new dataset for request`);
      }
    })
  );

  // Get dataset
  router.get(
    '/projects/:projectId/datasets/:dataSetId',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<GetDataSetByProjectRequest>(
        GetDataSetByProjectRequestParser,
        {
          ...req.params,
          user: res.locals.user
        }
      );
      const { dataSetId, user } = validatedRequest;
      const dataset = await dataSetService.getDataSet(dataSetId, user);
      res.send(dataset);
    })
  );

  // Add file to dataset
  router.get(
    '/projects/:projectId/datasets/:dataSetId/upload-requests',
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

  // List project dataSets
  router.get(
    '/projects/:projectId/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListDataSetRequest>(ListDataSetRequestParser, {
        ...req.params,
        ...req.query,
        user: res.locals.user
      });
      const { user, projectId, pageSize, paginationToken } = validatedRequest;
      try {
        const response = await dataSetService.listDataSetsForProject(
          projectId,
          user,
          pageSize || DEFAULT_API_PAGE_SIZE,
          paginationToken
        );
        res.send(response);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing datasets for project`);
      }
    })
  );

  // Get DataSet
  router.get(
    '/datasets/:datasetId',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<GetDataSetRequest>(GetDataSetRequestParser, {
        dataSetId: req.params.datasetId,
        user: res.locals.user
      });
      const { user, dataSetId } = validatedRequest;

      try {
        const response = await dataSetService.getDataSet(dataSetId, user);
        res.send(response);
      } catch (e) {
        if (isDataSetNotFoundError(e)) {
          throw Boom.notFound(e.message);
        }
        console.error(e);
        throw Boom.badImplementation(`There was a problem getting dataset`);
      }
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

      try {
        await dataSetService.addAccessForProject(validatedRequest);
        res.status(204).send();
      } catch (e) {
        console.error(e);

        if (isConflictError(e)) {
          throw Boom.conflict(e.message);
        }

        throw Boom.badImplementation(`There was a problem associating the project and dataset.`);
      }
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

      try {
        await dataSetService.removeAccessForProject(validatedRequest);
      } catch (e) {
        console.error(e);

        if (isConflictError(e)) {
          throw Boom.conflict(e.message);
        }

        throw Boom.badImplementation(`There was a problem removing access to`);
      }

      res.status(204).send();
    })
  );

  router.get(
    '/projects/:projectId/datasets/:datasetId/permissions',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListDataSetAccessPermissionsRequest>(
        ListDataSetAccessPermissionsRequestParser,
        {
          ...req.query,
          authenticatedUser: res.locals.user,
          dataSetId: req.params.datasetId
        }
      );
      try {
        res.send(await dataSetService.listDataSetAccessPermissions(validatedRequest));
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing permission for dataset`);
      }
    })
  );

  router.delete(
    '/projects/:projectId/datasets/:datasetId',
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

        if (isConflictError(e) || isDataSetHasEndpointError(e)) {
          throw Boom.conflict(e.message);
        }

        if (isDataSetInvalidParameterError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem deleting`);
      }
    })
  );
}
