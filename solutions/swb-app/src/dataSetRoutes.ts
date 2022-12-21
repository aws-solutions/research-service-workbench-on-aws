/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey, uuidWithLowercasePrefixRegExp } from '@aws/workbench-core-base';
import { CreateDataSetSchema, CreateExternalEndpointSchema } from '@aws/workbench-core-datasets';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpDSRoutes(router: Router, dataSetService: DataSetPlugin): void {
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
        storageProvider: dataSetService.storagePlugin
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
        storageProvider: dataSetService.storagePlugin
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
      processValidatorResult(validate(req.body, CreateExternalEndpointSchema));
      await dataSetService.addDataSetExternalEndpoint({
        dataSetId: req.params.id,
        externalEndpointName: req.body.externalEndpointName,
        externalRoleName: req.body.externalRoleName,
        kmsKeyArn: req.body.kmsKeyArn,
        vpcId: req.body.vpcId
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
