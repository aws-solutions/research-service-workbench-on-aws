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
  public addPutRequests(items: { [key: string]: AttributeValue }[]): TransactEdit {
    if (!this._params.TransactItems) {
      throw new Error(
        'TransactEdit<==need to initialize the TransactItems property before adding new request'
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
