/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AttributeValue,
  TransactWriteItemsCommandInput,
  TransactWriteItemsCommandOutput,
  DynamoDB
} from '@aws-sdk/client-dynamodb';
import _ from 'lodash';

/**
 * This class helps with batch writes or deletes.
 */
class TransactEdit {
  private _ddb: DynamoDB;
  private _params: TransactWriteItemsCommandInput;
  private _tableName: string;

  public constructor(config: { region: string }, table: string) {
    this._ddb = new DynamoDB({ ...config });
    this._tableName = table;
    this._params = { TransactItems: [] };
  }

  /**
   *
   * @param items - Object of the items to add
   */
  public addPutItems(items: Record<string, AttributeValue>[]): TransactEdit {
    if (!this._params.TransactItems) {
      throw new Error(
        'TransactEdit needs to initialize the TransactItems property before adding new request'
      );
    }
    const updatedItems = items.map((item) => {
      // Add updatedAt and createdAt attributes
      const currentTime = new Date().toISOString();
      if (item.updatedAt === undefined) {
        item.updatedAt = { S: `${currentTime}` };
      }
      if (item.createdAt === undefined) {
        item.createdAt = { S: `${currentTime}` };
      }
      return item;
    });

    updatedItems.forEach((item) => {
      this._params.TransactItems!.push({
        Put: {
          TableName: this._tableName,
          Item: item
        }
      });
    });
    return this;
  }
  /**
   * Add put requests
   * @param putRequests - A list of put request to add
   * @returns
   */
  public addPutRequests(
    putRequests: {
      item: Record<string, AttributeValue>;
      conditionExpression?: string;
      expressionAttributeNames?: Record<string, string>;
      expressionAttributeValues?: Record<string, AttributeValue>;
    }[]
  ): TransactEdit {
    putRequests.forEach((putRequest) => {
      const requriedParams = {
        Item: putRequest.item,
        TableName: this._tableName
      };
      const conditionalParams = {
        ConditionExpression: putRequest.conditionExpression,
        ExpressionAttributeNames: putRequest.expressionAttributeNames,
        ExpressionAttributeValues: putRequest.expressionAttributeValues
      };
      const additonalParams = _.omitBy(conditionalParams, _.isNil);

      this._params.TransactItems!.push({
        Put: {
          ...requriedParams,
          ...additonalParams
        }
      });
    });
    return this;
  }

  /**
   * Add one or more delete request(s) to the command input. Use to delete one or more items from a DynamoDB Table.
   *
   * @param keys - list of object(s) of the primary key(s) of item(s) to delete
   * @returns TransactEdit item with populated params
   */
  public addDeleteRequests(keys: Record<string, AttributeValue>[]): TransactEdit {
    keys.forEach((key) => {
      this.addDeleteRequest(key);
    });
    return this;
  }

  /**
   * Add a single delete request to the command input. Use to delete a single item from a DynamoDB Table.
   *
   * @param key - object of the primary key of item to delete
   * @returns TransactEdit item with populated params
   */
  public addDeleteRequest(key: Record<string, AttributeValue>): TransactEdit {
    if (!this._params.TransactItems) {
      throw new Error(
        'TransactEdit needs to initialize the TransactItems property before adding new request'
      );
    }
    this._params.TransactItems!.push({
      Delete: {
        Key: key,
        TableName: this._tableName
      }
    });
    return this;
  }

  /**
   * Gets the internal _params value of the command input.
   *
   * @returns The parameters for the TransactWriteItemsCommandInput
   */
  public getParams(): TransactWriteItemsCommandInput {
    return this._params;
  }

  /**
   * Sends the internal parameters as input to the DynamoDB table to execute write request(s).
   * Call this after populating the command input params with the above methods.
   * If UnproccessedItems is non empty, some request failed.
   *
   * @returns The output from the transact write item command
   */
  public async execute(): Promise<TransactWriteItemsCommandOutput> {
    return await this._ddb.transactWriteItems(this._params);
  }
}

export default TransactEdit;
