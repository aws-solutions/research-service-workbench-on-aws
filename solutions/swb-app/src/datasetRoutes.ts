/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { MetadataService, resourceTypeToKey, uuidWithLowercasePrefixRegExp } from '@aws/workbench-core-base';
import {
  CreateDataSetSchema,
  CreateExternalEndpointSchema,
  DataSetService,
  DataSetsStoragePlugin
} from '@aws/workbench-core-datasets';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { wrapAsync } from './errorHandlers';
import {
  DatasetEnvironmentMetadata,
  DatasetEnvironmentMetadataParser
} from './schemas/datasetEnvironmentMetadataParser';
import { processValidatorResult } from './validatorHelper';

export function setUpDSRoutes(
  router: Router,
  dataSetService: DataSetService,
  dataSetStoragePlugin: DataSetsStoragePlugin,
  metadataService: MetadataService
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
        storageProvider: dataSetStoragePlugin
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
        storageProvider: dataSetStoragePlugin
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
      if (req.params.id.match(uuidWithLowercasePrefixRegExp(resourceTypeToKey.dataset)) === null) {
        throw Boom.badRequest('id request parameter is invalid');
      }
      const ds = await dataSetService.getDataSet(req.params.id);
      res.send(ds);
    })
  );

  // Delete dataset
  router.delete(
    '/datasets/:datasetId',
    wrapAsync(async (req: Request, res: Response) => {
      const checkDatasetDependencies = async (datasetId: string): Promise<void> => {
        const { data: environments } =
          await metadataService.listDependentMetadata<DatasetEnvironmentMetadata>(
            resourceTypeToKey.dataset,
            datasetId,
            resourceTypeToKey.environment,
            DatasetEnvironmentMetadataParser,
            { pageSize: 1 }
          );

        if (environments.length) {
          throw Boom.badRequest(`Cannot delete dataset because it has environments associated with it.`);
        }
      };

      await dataSetService.removeDataSet(req.params.datasetId, checkDatasetDependencies);
      res.status(204).send();
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
