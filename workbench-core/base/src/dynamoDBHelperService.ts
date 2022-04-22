/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import DynamoDBBatchWriteOrDeleteService from './dynamoDBBatchWriteOrDeleteService';
import DynamoDBDeleterService from './dynamoDBDeleterService';
import DynamoDBGetterService from './dynamoDBGetterService';
import DynamoDBQueryService from './dynamoDBQueryService';
import DynamoDBScannerService from './dynamoDBScannerService';
import DynamoDBUpdaterService from './dynamoDBUpdaterService';

import { AttributeValue } from '@aws-sdk/client-dynamodb';

export default class DynamoDBHelperService {
  private _ddbScanner?: DynamoDBScannerService;
  private _ddbGetter?: DynamoDBGetterService;
  private _ddbQuery?: DynamoDBQueryService;
  private _ddbUpdater?: DynamoDBUpdaterService;
  private _ddbDeleter?: DynamoDBDeleterService;
  private _ddbBatchWriteOrDeleter?: DynamoDBBatchWriteOrDeleteService;
  private _awsRegion: string;
  private _tableName: string;

  public constructor(constants: { region: string; table: string }) {
    const { region, table } = constants;
    this._awsRegion = region;
    this._tableName = table;
  }

  public scan(): DynamoDBScannerService {
    return new DynamoDBScannerService({ region: this._awsRegion, table: this._tableName });
  }

  public get(
    key: { [key: string]: AttributeValue } | { [key: string]: AttributeValue }[]
  ): DynamoDBGetterService {
    return new DynamoDBGetterService({ region: this._awsRegion, table: this._tableName, key: key });
  }

  public query(): DynamoDBQueryService {
    return new DynamoDBQueryService({ region: this._awsRegion, table: this._tableName });
  }

  public update(key: { [key: string]: AttributeValue }): DynamoDBUpdaterService {
    return new DynamoDBUpdaterService({ region: this._awsRegion, table: this._tableName, key: key });
  }

  public delete(key: { [key: string]: AttributeValue }): DynamoDBDeleterService {
    return new DynamoDBDeleterService({ region: this._awsRegion, table: this._tableName, key: key });
  }

  public batchWrite(): DynamoDBBatchWriteOrDeleteService {
    return new DynamoDBBatchWriteOrDeleteService({ region: this._awsRegion, table: this._tableName });
  }

  public batchDelete(): DynamoDBBatchWriteOrDeleteService {
    return new DynamoDBBatchWriteOrDeleteService({ region: this._awsRegion, table: this._tableName });
  }
}
