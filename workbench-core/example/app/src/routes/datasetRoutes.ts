/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { uuidWithLowercasePrefixRegExp } from '@aws/workbench-core-base';
import {
  CreateDataSetSchema,
  CreateExternalEndpointSchema,
  DataSetService,
  DataSetsStoragePlugin
} from '@aws/workbench-core-datasets';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { dataSetPrefix, endPointPrefix } from '../configs/constants';
import { wrapAsync } from '../utilities/errorHandlers';
import { processValidatorResult } from '../utilities/validatorHelper';

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
        req.body.region,
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
        req.body.region,
        dataSetStoragePlugin
      );
      res.status(201).send(dataSet);
    })
  );

  // share dataset
  router.post(
    '/datasets/:id/share',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.id.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('id request parameter is invalid');
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

  // unshare dataset
  router.delete(
    '/datasets/:datasetId/share/:endpointId',
    wrapAsync(async (req: Request, res: Response) => {
      if (
        req.params.datasetId.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null ||
        req.params.endpointId.match(uuidWithLowercasePrefixRegExp(endPointPrefix)) === null
      ) {
        await dataSetService.removeDataSetExternalEndpoint(
          req.params.datasetId,
          req.params.endpointId,
          dataSetStoragePlugin
        );
        res.status(204).send();
      }
    })
  );

  // Get dataset
  router.get(
    '/datasets/:id',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.id.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('id request parameter is invalid');
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

  // Delete dataset
  router.delete(
    '/datasets/:id',
    wrapAsync(async (req: Request, res: Response) => {
      if (req.params.id.match(uuidWithLowercasePrefixRegExp(dataSetPrefix)) === null) {
        throw Boom.badRequest('id request parameter is invalid');
      }
      await dataSetService.removeDataSet(req.params.id);
      res.status(204).send();
    })
  );
}
