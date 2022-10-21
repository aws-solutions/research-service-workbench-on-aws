/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { AwsService, resourceTypeToKey, buildPkSk } from '@aws/workbench-core-base';
import Boom from '@hapi/boom';

interface CostCenter {
  id: string;
  name: string;
  dependency: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Acc Metadata
  subnetId: string;
  vpcId: string;
  envMgmtRoleArn: string;
  externalId: string;
  encryptionKeyArn: string;
  environmentInstanceFiles: string;
  hostingAccountHandlerRoleArn: string;
  awsAccountId: string;
}

export default class CostCenterService {
  private _aws: AwsService;
  private _resourceType: string = 'costCenter';

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  public async getCostCenter(costCenterId: string): Promise<CostCenter> {
    // Get by id
    const response = (await this._aws.helpers.ddb
      .get(buildPkSk(costCenterId, resourceTypeToKey.costCenter))
      .execute()) as GetItemCommandOutput;

    const item = (response as GetItemCommandOutput).Item;

    if (item === undefined) {
      throw Boom.notFound(`Could not find cost center ${costCenterId}`);
    } else {
      const costCenter = item as unknown as CostCenter;
      return Promise.resolve(costCenter);
    }
  }

  public async isCostCenterValid(costCenterId: string): Promise<boolean> {
    // Get by id
    const response = (await this._aws.helpers.ddb
      .get(buildPkSk(costCenterId, resourceTypeToKey.costCenter))
      .execute()) as GetItemCommandOutput;

    // If anything is returned, cost center is valid
    if (response.Item) {
      return true;
    }

    // else, cost center is not valid
    return false;
  }
}
