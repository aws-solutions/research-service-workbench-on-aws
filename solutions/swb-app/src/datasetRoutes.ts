// Environment launch
import { DataSetService, DataSetsStoragePlugin } from '@amzn/workbench-core-datasets';
import { NextFunction, Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpDSRoutes(
  router: Router,
  dataSetService: DataSetService,
  dataSetStoragePlugin: DataSetsStoragePlugin
): void {
  // create new prefix
  router.post(
    '/data-set',
    wrapAsync(async (req: Request, res: Response) => {
      // We check that envType is in list of supportedEnvs before calling the environments object
      //eslint-disable-next-line security/detect-object-injection
      await dataSetService.provisionDataSet(
        req.body.datasetName,
        req.body.storageName,
        req.body.path,
        req.body.awsAccountId,
        dataSetStoragePlugin
      );
      res.status(201).send();
    })
  );

  // import new prefix
  router.post(
    '/data-set/import',
    wrapAsync(async (req: Request, res: Response) => {
      // We check that envType is in list of supportedEnvs before calling the environments object
      //eslint-disable-next-line security/detect-object-injection
      await dataSetService.importDataSet(
        req.body.datasetName,
        req.body.storageName,
        req.body.path,
        req.body.awsAccountId,
        dataSetStoragePlugin
      );
      res.status(201).send();
    })
  );
  // share dataset
  router.post(
    '/data-set/share',
    wrapAsync(async (req: Request, res: Response) => {
      // We check that envType is in list of supportedEnvs before calling the environments object
      //eslint-disable-next-line security/detect-object-injection
      await dataSetService.addDataSetExternalEndpoint(
        req.body.datasetName,
        req.body.externalEndpointName,
        req.body.externalRoleName,
        dataSetStoragePlugin
      );
      res.status(201).send();
    })
  );

  // Get dataset
  router.get(
    '/datasets/:id',
    wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
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
