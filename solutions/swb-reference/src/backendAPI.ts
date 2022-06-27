/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { HostingAccountService, EnvironmentService } from '@amzn/environments';
import { generateRouter, ApiRouteConfig } from '@amzn/swb-app';
import { AuditService, BaseAuditPlugin, Writer, AuditEntry } from '@amzn/workbench-core-audit';
import {
  DataSetService,
  S3DataSetStoragePlugin,
  DdbDataSetMetadataPlugin
} from '@amzn/workbench-core-datasets';
import { LoggingService } from '@amzn/workbench-core-logging';
import { Express } from 'express';
import SagemakerEnvironmentConnectionService from './environment/sagemaker/sagemakerEnvironmentConnectionService';
import SagemakerEnvironmentLifecycleService from './environment/sagemaker/sagemakerEnvironmentLifecycleService';

const logger = new LoggingService();

class AuditLogger implements Writer {
  private _logger: LoggingService;
  public constructor(logger: LoggingService) {
    this._logger = logger;
  }

  public async write(metadata: unknown, auditEntry: AuditEntry): Promise<void> {
    this._logger.info('test', {});
  }
}

const apiRouteConfig: ApiRouteConfig = {
  routes: [
    {
      path: '/foo',
      serviceAction: 'launch',
      httpMethod: 'post',
      service: new SagemakerEnvironmentLifecycleService()
    }
  ],
  environments: {
    sagemaker: {
      lifecycle: new SagemakerEnvironmentLifecycleService(),
      connection: new SagemakerEnvironmentConnectionService()
    }

    // Add your environment types here as follows:
    // <newEnvTypeName>: {
    //   lifecycle: new <newEnvTypeName>EnvironmentLifecycleService(),
    //   connection: new <newEnvTypeName>EnvironmentConnectionService()
    // }
  },
  account: new HostingAccountService(),
  environmentService: new EnvironmentService({
    TABLE_NAME: process.env.STACK_NAME!
  }),
  dataSetService: new DataSetService(
    new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
    logger,
    new DdbDataSetMetadataPlugin(
      { region: 'us-east-1', ddbTableName: process.env.STACK_NAME! },
      'DATASET',
      'ENDPOINT'
    )
  ),
  dataSetsStoragePlugin: new S3DataSetStoragePlugin({ region: 'us-east-1' })
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
