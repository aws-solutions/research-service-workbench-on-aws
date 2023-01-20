/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser, AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import {
  uuidRegExpAsString,
  uuidWithLowercasePrefixRegExp,
  validateAndParse
} from '@aws/workbench-core-base';
import {
  addDatasetPermissionsToRole,
  AddDatasetPermissionsToRoleSchema,
  CreateDataSetSchema,
  createRegisterExternalBucketRole,
  CreateRegisterExternalBucketRoleSchema,
  DataSetService,
  DataSetsStoragePlugin,
  isDataSetHasEndpointError,
  isDataSetNotFoundError,
  isEndpointNotFoundError,
  isInvalidArnError,
  isInvalidEndpointError,
  isInvalidIamRoleError,
  isNotAuthorizedError,
  isEndpointExistsError,
  isInvalidPermissionError,
  PermissionsResponse
} from '@aws/workbench-core-datasets';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { dataSetPrefix, endpointPrefix, groupIdRegExAsString } from '../configs/constants';
import {
  AddRemoveAccessPermissionRequest,
  AddRemoveAccessPermissionParser
} from '../models/datasets/addRemoveAccessPermission';
import {
  CreateExternalEndpoint,
  CreateExternalEndpointParser
} from '../models/datasets/createExternalEndpoint';
import {
  CreatePresignedSinglePartFileUploadUrl,
  CreatePresignedSinglePartFileUploadUrlParser
} from '../models/datasets/createPresignedFileUpload.ts';
import { wrapAsync } from '../utilities/errorHandlers';
import { processValidatorResult } from '../utilities/validatorHelper';

const timeToLiveSeconds: number = 60 * 1; // 1 minute

export function setUpDSRoutes(
  router: Router,
  dataSetService: DataSetService,
  dataSetStoragePlugin: DataSetsStoragePlugin
): void {
  // creates new prefix in S3 (assumes S3 bucket exist already)
  router.post(
    '/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateDataSetSchema));
      const dataSet = await dataSetService.provisionDataSet({
        name: req.body.datasetName,
        storageName: req.body.storageName,
        path: req.body.path,
        awsAccountId: req.body.awsAccountId,
        region: req.body.region,
        storageProvider: dataSetStoragePlugin,
        authenticatedUser: res.locals.user,
        permissions: req.body.permissions
      });
      res.status(201).send(dataSet);
    })
  );

  // import new prefix (assumes S3 bucket and path exist already)
  router.post(
    '/datasets/import',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateDataSetSchema));
      const dataSet = await dataSetService.importDataSet({
        name: req.body.datasetName,
        storageName: req.body.storageName,
        path: req.body.path,
        awsAccountId: req.body.awsAccountId,
        region: req.body.region,
        storageProvider: dataSetStoragePlugin,
        authenticatedUser: res.locals.user,
        permissions: req.body.permissions
      });
      res.status(201).send(dataSet);
    })
  );

  // share dataset
  router.post(
    '/datasets/:datasetId/share',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const validatedRequest = validateAndParse<CreateExternalEndpoint>(
          CreateExternalEndpointParser,
          req.body
        );
        const authenticatedUser = validateAndParse<AuthenticatedUser>(
          AuthenticatedUserParser,
          res.locals.user
        );

        const { userId, groupId } = validatedRequest;

        if (!userId && !groupId) {
          throw Boom.badRequest('Request body must have either "userId" or "groupId" defined.');
        }

        if (userId && groupId) {
          throw Boom.badRequest('Request body must not have both "userId" and "groupId" defined.');
        }

        if (groupId) {
          const { data } = await dataSetService.addDataSetExternalEndpointForGroup({
            ...validatedRequest,
            dataSetId: req.params.datasetId,
            storageProvider: dataSetStoragePlugin,
            groupId,
            authenticatedUser
          });
          return res.status(201).send(data);
        }

        const { data } = await dataSetService.addDataSetExternalEndpointForUser({
          ...validatedRequest,
          dataSetId: req.params.datasetId,
          storageProvider: dataSetStoragePlugin,
          userId: userId!,
          authenticatedUser
        });
        res.status(201).send(data);
      } catch (error) {
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        if (isNotAuthorizedError(error)) {
          throw Boom.forbidden(error.message);
        }
        if (isEndpointExistsError(error) || isInvalidArnError(error)) {
          throw Boom.badRequest(error.message);
        }
        throw error;
      }
    })
  );

  // unshare dataset
  router.delete(
    '/datasets/:datasetId/share/:endpointId',
    wrapAsync(async (req: Request, res: Response) => {
      if (
        req.params.datasetId.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null ||
        req.params.endpointId.match(uuidWithLowercasePrefixRegExp(endpointPrefix)) === null
      ) {
        throw Boom.badRequest('datasetId and endpointId parameters must be valid');
      }

      await dataSetService.removeDataSetExternalEndpoint(
        req.params.datasetId,
        req.params.endpointId,
        dataSetStoragePlugin,
        res.locals.user
      );
      res.status(204).send();
    })
  );

  // get dataset endpoint mount object
  router.get(
    '/datasets/:datasetId/share/:endpointId/mount-object',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const authenticatedUser = validateAndParse<AuthenticatedUser>(
          AuthenticatedUserParser,
          res.locals.user
        );

        const { data } = await dataSetService.getDataSetMountObject({
          dataSetId: req.params.datasetId,
          endpointId: req.params.endpointId,
          authenticatedUser
        });
        res.status(200).send(data);
      } catch (error) {
        if (isDataSetNotFoundError(error) || isEndpointNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        if (isInvalidEndpointError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isNotAuthorizedError(error)) {
          throw Boom.forbidden(error.message);
        }
        throw error;
      }
    })
  );

  // Get presigned single part file upload URL
  router.post(
    '/datasets/:datasetId/presignedUpload',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const validatedRequest = validateAndParse<CreatePresignedSinglePartFileUploadUrl>(
          CreatePresignedSinglePartFileUploadUrlParser,
          req.body
        );

        const url = await dataSetService.getPresignedSinglePartUploadUrl(
          req.params.datasetId,
          validatedRequest.fileName,
          timeToLiveSeconds,
          dataSetStoragePlugin,
          res.locals.user
        );
        res.status(200).send({ url });
      } catch (error) {
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );

  // List storage locations
  router.get(
    '/datasets/storage',
    wrapAsync(async (req: Request, res: Response) => {
      const locations = await dataSetService.listStorageLocations(res.locals.user);
      res.send(locations);
    })
  );

  // Get dataset
  router.get(
    '/datasets/:datasetId',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const ds = await dataSetService.getDataSet(req.params.datasetId, res.locals.user);
        res.status(200).send(ds);
      } catch (error) {
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );

  // List datasets
  router.get(
    '/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await dataSetService.listDataSets(res.locals.user);
      res.send(response);
    })
  );

  // Delete dataset
  router.delete(
    '/datasets/:datasetId',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        await dataSetService.removeDataSet(req.params.datasetId, () => Promise.resolve(), res.locals.user);
      } catch (error) {
        if (isDataSetHasEndpointError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
      res.status(204).send();
    })
  );

  // creates new IAM role string to access an external bucket
  router.post(
    '/datasets/iam',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateRegisterExternalBucketRoleSchema));
      const role = createRegisterExternalBucketRole({
        roleName: req.body.roleName,
        awsAccountId: req.body.awsAccountId,
        awsBucketRegion: req.body.awsBucketRegion,
        s3BucketArn: req.body.s3BucketArn,
        assumingAwsAccountId: req.body.assumingAwsAccountId,
        externalId: req.body.externalId,
        kmsKeyArn: req.body.kmsKeyArn
      });
      res.status(201).send(role);
    })
  );

  // updates an existing IAM role string to add permission to access a dataset
  router.patch(
    '/datasets/iam',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, AddDatasetPermissionsToRoleSchema));
      try {
        const role = addDatasetPermissionsToRole({
          roleString: req.body.roleString,
          accessPointArn: req.body.accessPointArn,
          datasetPrefix: req.body.datasetPrefix
        });
        res.status(200).send(role);
      } catch (error) {
        if (isInvalidIamRoleError(error)) {
          throw Boom.badRequest('the roleString parameter does not represent a valid IAM role');
        }
        throw error;
      }
    })
  );

  // add dataset access permission
  router.post(
    '/datasets/:datasetId/permissions',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.datasetId.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('datasetid request parameter is invalid');
      }
      const validatedRequest = validateAndParse<AddRemoveAccessPermissionRequest>(
        AddRemoveAccessPermissionParser,
        req.body
      );
      let response: PermissionsResponse;
      try {
        response = await dataSetService.addDataSetAccessPermissions({
          authenticatedUser: res.locals.user,
          dataSetId: req.params.datasetId,
          ...validatedRequest
        });
        res.status(201).send(response);
      } catch (error) {
        if (isInvalidPermissionError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );

  // get all dataset access permissions
  router.get(
    '/datasets/:datasetId/permissions',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.datasetId.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('datasetid request parameter is invalid');
      }
      try {
        const response = await dataSetService.getAllDataSetAccessPermissions(
          req.params.datasetId,
          res.locals.user
        );
        res.status(200).send(response);
      } catch (error) {
        if (isInvalidPermissionError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );

  // get specific dataset access permissions for a group
  router.get(
    '/datasets/:datasetId/permissions/roles/:roleId',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.datasetId.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('datasetid request parameter is invalid');
      }
      if (req.params.roleId.match(groupIdRegExAsString) === null) {
        throw Boom.badRequest('groupId must be in the form of a uuid.');
      }
      try {
        const response = await dataSetService.getDataSetAccessPermissions(
          {
            dataSetId: req.params.datasetId,
            identityType: 'GROUP',
            identity: req.params.roleId
          },
          res.locals.user
        );
        res.status(200).send(response);
      } catch (error) {
        if (isInvalidPermissionError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );

  // get specific dataset access permissions for a user
  router.get(
    '/datasets/:datasetId/permissions/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.datasetId.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('datasetid request parameter is invalid');
      }
      if (req.params.userId.match(uuidRegExpAsString) === null) {
        throw Boom.badRequest('userId must be in the form of a uuid.');
      }
      try {
        const response = await dataSetService.getDataSetAccessPermissions(
          {
            dataSetId: req.params.datasetId,
            identityType: 'USER',
            identity: req.params.userId
          },
          res.locals.user
        );
        res.status(200).send(response);
      } catch (error) {
        if (isInvalidPermissionError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );

  // remove dataset access permission for user
  router.delete(
    '/datasets/:datasetId/permissions/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.datasetId.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('datasetid request parameter is invalid');
      }
      if (req.params.userId.match(uuidRegExpAsString) === null) {
        throw Boom.badRequest('userId must be in the form of a uuid.');
      }
      if (req.body.accessLevel !== 'read-write' && req.body.accessLevel !== 'read-only') {
        throw Boom.badRequest("accessLevel must be 'read-only' or 'read-write'.");
      }
      try {
        const response: PermissionsResponse = await dataSetService.removeDataSetAccessPermissions({
          authenticatedUser: res.locals.user,
          dataSetId: req.params.datasetId,
          permission: {
            identity: req.params.userId,
            identityType: 'USER',
            accessLevel: req.body.accessLevel
          }
        });
        res.status(200).send(response);
      } catch (error) {
        if (isInvalidPermissionError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );

  // remove dataset access permission for group
  router.delete(
    '/datasets/:datasetId/permissions/roles/:roleId',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.datasetId.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('datasetid request parameter is invalid');
      }
      if (req.params.roleId.match(groupIdRegExAsString) === null) {
        throw Boom.badRequest('groupId must be in the form of a uuid.');
      }
      if (req.body.accessLevel !== 'read-write' && req.body.accessLevel !== 'read-only') {
        throw Boom.badRequest("accessLevel must be 'read-only' or 'read-write'.");
      }
      try {
        const response: PermissionsResponse = await dataSetService.removeDataSetAccessPermissions({
          authenticatedUser: res.locals.user,
          dataSetId: req.params.datasetId,
          permission: {
            identity: req.params.roleId,
            identityType: 'GROUP',
            accessLevel: req.body.accessLevel
          }
        });
        res.status(200).send(response);
      } catch (error) {
        if (isInvalidPermissionError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isDataSetNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );
}
