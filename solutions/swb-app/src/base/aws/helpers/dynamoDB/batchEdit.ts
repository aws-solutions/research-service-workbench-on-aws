/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AttributeValue,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  DeleteRequest,
  PutRequest,
  DynamoDB
} from '@aws-sdk/client-dynamodb';

/**
 * This class helps with batch writes or deletes.
 */
class BatchEdit {
  private _ddb: DynamoDB;
  private _params: BatchWriteItemCommandInput;
  private _tableName: string;

  public constructor(config: { region: string }, table: string) {
    this._ddb = new DynamoDB({ ...config });
    this._tableName = table;
    this._params = { RequestItems: {} };
    this._params.RequestItems = {};
    this._params.RequestItems[this._tableName] = [];
  }

  /**
   * Add a single delete request to the command input. Use to delete a single item from a DynamoDB Table.
   *
   * @param key - object of the primary key of item to delete
   * @returns BatchEdit item with populated params
   */
  public addDeleteRequest(key: { [key: string]: AttributeValue }): BatchEdit {
    if (!this._params.RequestItems) {
      throw new Error('BatchEdit<==need to initialize the RequestItems property before adding new request');
    }
    const deleteRequest: DeleteRequest = { Key: key };
    this._params.RequestItems[this._tableName].push({ DeleteRequest: deleteRequest });
    return this;
  }

  /**
   * Add a single write request to the command input. Use to write a single new item to a DynamoDB Table.
   *
   * @param item - object of the item to add
   * @returns BatchEdit item with populated params
   */
  public addWriteRequest(item: { [key: string]: AttributeValue }): BatchEdit {
    if (!this._params.RequestItems) {
      throw new Error('BatchEdit<==need to initialize the RequestItems property before adding new request');
    }
    // Add updatedAt and createdAt attributes
    const currentTime = new Date().toISOString();
    if (item.updatedAt === undefined) {
      item.updatedAt = { S: `${currentTime}` };
    }
    if (item.createdAt === undefined) {
      item.createdAt = { S: `${currentTime}` };
    }
    const writeRequest: PutRequest = { Item: item };
    this._params.RequestItems[this._tableName].push({ PutRequest: writeRequest });
    return this;
  }

  /**
   * Add one or more delete request(s) to the command input. Use to delete one or more items from a DynamoDB Table.
   *
   * @param keys - list of object(s) of the primary key(s) of item(s) to delete
   * @returns BatchEdit item with populated params
   */
  public addDeleteRequests(keys: { [key: string]: AttributeValue }[]): BatchEdit {
    keys.forEach((key) => {
      this.addDeleteRequest(key);
    });
    return this;
  }

  /**
   * Add one or more write request(s) to the command input. Use to write one or more new item(s) to a DynamoDB Table.
   *
   * @param items - list of object(s) of the item(s) to add
   * @returns BatchEdit item with populated params
   */
  public addWriteRequests(items: { [key: string]: AttributeValue }[]): BatchEdit {
    items.forEach((item) => {
      this.addWriteRequest(item);
    });
    return this;
  }

  /**
   * Gets the internal _params value of the command input.
   *
   * @returns The parameters for the BatchWriteItemCommandInput
   *
   * @example Returning command input
   * ```ts
   * # Result
   * {
   *  RequestItems: {
   *    <TableName>: [
   *      DeleteRequest?: {
   *        Key: {}
   *      },
   *      PutRequest?: {
   *        Item: {}
   *      }
   *    ]
   *  }
   * }
   * ```
   */
  public getParams(): BatchWriteItemCommandInput {
    return this._params;
  }

  /**
   * Sends the internal parameters as input to the DynamoDB table to execute write and/or delete request(s).
   * Call this after populating the command input params with the above methods.
   * If UnproccessedItems is non empty, some request failed.
   *
   * @returns The output from the batch write item command
   *
   * @example
   * ```ts
   * # Result
   * {
   *  ConsumedCapacity?: [],
   *  ItemCollectionMetrics?: {},
   *  UnprocessedItems?: {}
   * }
   * ```
   */
  public async execute(): Promise<BatchWriteItemCommandOutput> {
    return await this._ddb.batchWriteItem(this._params);
  }
}

export default BatchEdit;
