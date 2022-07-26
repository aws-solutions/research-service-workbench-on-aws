/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateDataSetSchema,
  CreateExternalEndpointSchema,
  DataSetService,
  DataSetsStoragePlugin
} from '@amzn/workbench-core-datasets';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { validate as uuidValidate } from 'uuid';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

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
      const dataSet = await dataSetService.provisionDataSet(
        req.body.datasetName,
        req.body.storageName,
        req.body.path,
        req.body.awsAccountId,
        dataSetStoragePlugin
      );
      res.status(201).send(dataSet);
    })
  );

  // import new prefix (assumes S3 bucket and path exist already)
  router.post(
    '/datasets/import',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateDataSetSchema));
      const dataSet = await dataSetService.importDataSet(
        req.body.datasetName,
        req.body.storageName,
        req.body.path,
        req.body.awsAccountId,
        dataSetStoragePlugin
      );
      res.status(201).send(dataSet);
    })
  );

  // share dataset
  router.post(
    '/datasets/:id/share',
    wrapAsync(async (req: Request, res: Response) => {
      if (!uuidValidate(req.params.id)) {
        throw Boom.badRequest('id request parameter must be a valid uuid.');
      }
      processValidatorResult(validate(req.body, CreateExternalEndpointSchema));
      await dataSetService.addDataSetExternalEndpoint(
        req.params.id,
        req.body.externalEndpointName,
        dataSetStoragePlugin,
        req.body.externalRoleName
      );
      res.status(201).send();
    })
  );

  // Get dataset
  router.get(
    '/datasets/:id',
    wrapAsync(async (req: Request, res: Response) => {
      if (!uuidValidate(req.params.id)) {
        throw Boom.badRequest('id request parameter must be a valid uuid.');
      }
      const ds = await dataSetService.getDataSet(req.params.id);
      res.send(ds);
    })
  );

  // List datasets
  router.get(
    '/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await dataSetService.listDataSets();
      res.send(response);
    })
  );
}
