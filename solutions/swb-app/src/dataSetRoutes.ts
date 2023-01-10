/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey, uuidWithLowercasePrefixRegExp } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { CreateDataSetRequest, CreateDataSetRequestParser } from './dataSets/createDataSetRequestParser';
import {
  CreateExternalEndpointRequest,
  CreateExternalEndpointRequestParser
} from './dataSets/createExternalEndpointRequestParser';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import { wrapAsync } from './errorHandlers';
import { validateAndParse } from './validatorHelper';

export function setUpDSRoutes(router: Router, dataSetService: DataSetPlugin): void {
  // creates new prefix in S3 (assumes S3 bucket exist already)
  router.post(
    '/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateDataSetRequest>(CreateDataSetRequestParser, req.body);
      const dataSet = await dataSetService.provisionDataSet({
        name: validatedRequest.name,
        storageName: validatedRequest.storageName,
        path: validatedRequest.path,
        awsAccountId: validatedRequest.awsAccountId,
        region: validatedRequest.region,
        storageProvider: dataSetService.storagePlugin,
        owner: validatedRequest.owner,
        type: validatedRequest.type
      });

      res.status(201).send(dataSet);
    })
  );

  // import new prefix (assumes S3 bucket and path exist already)
  router.post(
    '/datasets/import',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateDataSetRequest>(req.body, CreateDataSetRequestParser);
      const dataSet = await dataSetService.importDataSet({
        name: validatedRequest.name,
        storageName: validatedRequest.storageName,
        path: validatedRequest.path,
        awsAccountId: validatedRequest.awsAccountId,
        region: validatedRequest.region,
        storageProvider: dataSetService.storagePlugin,
        owner: validatedRequest.owner,
        type: validatedRequest.type
      });
      res.status(201).send(dataSet);
    })
  );

  // share dataset
  router.post(
    '/datasets/:id/share',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.id.match(uuidWithLowercasePrefixRegExp(resourceTypeToKey.dataset)) === null) {
        throw Boom.badRequest('id request parameter is invalid');
      }
      const validatedRequest = validateAndParse<CreateExternalEndpointRequest>(
        req.body,
        CreateExternalEndpointRequestParser
      );
      await dataSetService.addDataSetExternalEndpoint({
        dataSetId: req.params.id,
        externalEndpointName: validatedRequest.externalEndpointName,
        groupId: 'TODO',
        authenticatedUser: res.locals.user,
        externalRoleName: validatedRequest.externalRoleName,
        kmsKeyArn: validatedRequest.kmsKeyArn,
        vpcId: validatedRequest.vpcId
      });
      res.status(201).send();
    })
  );

  // Get dataset
  router.get(
    '/datasets/:id',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.id.match(uuidWithLowercasePrefixRegExp(resourceTypeToKey.dataset)) === null) {
        throw Boom.badRequest('id request parameter is invalid');
      }
      const ds = await dataSetService.getDataSet(req.params.id);
      res.send(ds);
    })
  );

  // List dataSets
  router.get(
    '/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await dataSetService.listDataSets();
      res.send(response);
    })
  );
}
