/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AttributeValue,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  DeleteRequest,
  PutRequest
} from '@aws-sdk/client-dynamodb';
import DynamoDB from './aws/services/dynamoDB';

/**
 * This class helps with batch writes or deletes.
 */
class BatchWriteOrDeleter {
  private _ddb: DynamoDB;
  private _params: BatchWriteItemCommandInput;
  private _tableName: string;
  public constructor(ddb: DynamoDB, table: string) {
    this._ddb = ddb;
    this._tableName = table;
    this._params = { RequestItems: {} };
    this._params.RequestItems = {};
    this._params.RequestItems[this._tableName] = [];
  }
  // same as TableName -- could be implemented later
  // public table(name: string): Scanner {
  //     if(_.isEmpty(_.trim(name))) {
  //         throw new Error(`DbScanner.table("${name}" <== must be a non-empty string).`)
  //     }
  //     this._params.TableName = name;
  //     return this;
  // }
  public addDeleteRequest(key: { [key: string]: AttributeValue }): BatchWriteOrDeleter {
    if (!this._params.RequestItems) {
      throw new Error(
        'BatchWriteOrDeleter<==need to initialize the RequestItems property before adding new request'
      );
    }
    const deleteRequest: DeleteRequest = { Key: key };
    this._params.RequestItems[this._tableName].push({ DeleteRequest: deleteRequest });
    return this;
  }

  public addWriteRequest(item: { [key: string]: AttributeValue }): BatchWriteOrDeleter {
    if (!this._params.RequestItems) {
      throw new Error(
        'BatchWriteOrDeleter<==need to initialize the RequestItems property before adding new request'
      );
    }
    const writeRequest: PutRequest = { Item: item };
    this._params.RequestItems[this._tableName].push({ PutRequest: writeRequest });
    return this;
  }

  public addDeleteRequests(keys: { [key: string]: AttributeValue }[]): BatchWriteOrDeleter {
    keys.forEach((key) => {
      this.addDeleteRequest(key);
    });
    return this;
  }

  public addWriteRequests(items: { [key: string]: AttributeValue }[]): BatchWriteOrDeleter {
    items.forEach((item) => {
      this.addWriteRequest(item);
    });
    return this;
  }

  public async batchWriteOrDelete(): Promise<BatchWriteItemCommandOutput> {
    return await this._ddb.batchWriteOrDelete(this._params);
  }
}

class DynamoDBBatchWriteOrDeleteService {
  private _ddb: DynamoDB;
  public batchWriteOrDelete: BatchWriteOrDeleter;
  public constructor(options: { region: string; table: string }) {
    this._ddb = new DynamoDB({ ...options });
    this.batchWriteOrDelete = new BatchWriteOrDeleter(this._ddb, options.table);
  }
}

export default DynamoDBBatchWriteOrDeleteService;
