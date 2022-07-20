import { DataSetService, DataSetsStoragePlugin } from '@amzn/workbench-core-datasets';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpDSRoutes(
  router: Router,
  dataSetService: DataSetService,
  dataSetStoragePlugin: DataSetsStoragePlugin
): void {
  // creates new prefix in S3 (assumes S3 bucket exist already)
  router.post(
    '/datasets',
    wrapAsync(async (req: Request, res: Response) => {
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
    '/datasets/share',
    wrapAsync(async (req: Request, res: Response) => {
      await dataSetService.addDataSetExternalEndpoint(
        req.body.datasetName,
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
      const ds = await dataSetService.getDataSet(req.params.id);
      res.send(ds);
    })
  );

  // Get datasets
  router.get(
    '/datasets',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await dataSetService.listDataSets();
      res.send(response);
    })
  );
}
