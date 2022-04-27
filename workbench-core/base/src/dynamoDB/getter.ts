/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AttributeValue,
  GetItemCommandInput,
  BatchGetItemCommandInput,
  GetItemCommandOutput,
  BatchGetItemCommandOutput
} from '@aws-sdk/client-dynamodb';
import _ = require('lodash');
import DynamoDB from '../aws/services/dynamoDB';

class Getter {
  private _ddb: DynamoDB;
  private _paramsItem: GetItemCommandInput | undefined;
  private _paramsBatch: BatchGetItemCommandInput | undefined;
  private _tableName: string;
  public constructor(options: {
    region: string;
    table: string;
    key: { [key: string]: AttributeValue } | { [key: string]: AttributeValue }[];
  }) {
    this._ddb = new DynamoDB({ ...options });
    this._tableName = options.table;
    if (Array.isArray(options.key)) {
      this._paramsBatch = { RequestItems: {} };
      this._paramsBatch.RequestItems = {};
      this._paramsBatch.RequestItems[this._tableName] = { Keys: Object.assign(options.key) };
    } else {
      this._paramsItem = { TableName: options.table, Key: options.key };
    }
  }
  // only for get item
  public table(name: string): Getter {
    if (!this._paramsItem) {
      return this;
    }
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`DbGetter.table("${name}" <== must be a string and can not be empty).`);
    }
    this._paramsItem.TableName = name;
    return this;
  }
  // only for get item
  // can be either key(key, value) or key({ key1: value1, key2: value2, ...})
  public key(args: { [key: string]: AttributeValue }): Getter {
    if (!this._paramsItem) {
      return this;
    }
    if (!this._paramsItem.Key) {
      this._paramsItem.Key = {};
    }
    this._paramsItem.Key = args;
    return this;
  }
  // only for BATCH get item
  //   must be keys([{ key1: value1, key2: value2, ... }, { keyA: valueA, keyB, valueB, ...}, ...])
  //   uses batchGet() API instead of just get()
  public keys(args: AttributeValue[]): Getter {
    if (!this._paramsBatch || !this._paramsBatch.RequestItems) {
      return this;
    }
    this._paramsBatch.RequestItems[this._tableName].Keys = Object.assign(args);
    return this;
  }
  // for both BATCH get item and get item
  // same as ConsistentRead = true
  public strong(): Getter {
    if (this._paramsItem) {
      this._paramsItem.ConsistentRead = true;
      return this;
    }
    if (this._paramsBatch && this._paramsBatch.RequestItems) {
      this._paramsBatch.RequestItems[this._tableName].ConsistentRead = true;
      return this;
    }
    return this;
  }
  // same as ExpressionAttributeNames
  public names(obj: { [key: string]: string } = {}): Getter {
    if (!_.isObject(obj)) {
      throw new Error(`DbGetter.names("${obj}" <== must be an object).`);
    }
    if (this._paramsItem) {
      this._paramsItem.ExpressionAttributeNames = {
        ...this._paramsItem.ExpressionAttributeNames,
        ...obj
      };
      return this;
    }
    if (this._paramsBatch && this._paramsBatch.RequestItems) {
      this._paramsBatch.RequestItems[this._tableName].ExpressionAttributeNames = {
        ...this._paramsBatch.RequestItems[this._tableName].ExpressionAttributeNames,
        ...obj
      };
      return this;
    }
    return this;
  }

  // same as ProjectionExpression
  public projection(expr: string | string[]): Getter {
    if (this._paramsItem) {
      return this._assignProjectionExressionToSingle(expr);
    }
    return this._assignProjectionExressionToBatch(expr);
  }

  private _assignProjectionExressionToSingle(expr: string | string[]): Getter {
    if (!this._paramsItem) {
      return this;
    }
    if (_.isEmpty(expr)) return this;
    if (_.isString(expr)) {
      if (this._paramsItem.ProjectionExpression) {
        this._paramsItem.ProjectionExpression = `${this._paramsItem.ProjectionExpression}, ${expr}`;
      } else {
        this._paramsItem.ProjectionExpression = expr;
      }
    } else if (Array.isArray(expr)) {
      const names: { [key: string]: string } = {};
      const values: string[] = [];
      expr.forEach((key) => {
        names[`#${key}`] = key;
        values.push(`#${key}`);
      });
      const str = values.join(', ');
      if (this._paramsItem.ProjectionExpression) {
        this._paramsItem.ProjectionExpression = `${this._paramsItem.ProjectionExpression}, ${str}`;
      } else {
        this._paramsItem.ProjectionExpression = str;
      }
      this._paramsItem.ExpressionAttributeNames = {
        ...this._paramsItem.ExpressionAttributeNames,
        ...names
      };
    } else {
      throw new Error(`DbGetter.projection("${expr}" <== must be a string or an array).`);
    }

    return this;
  }
  private _assignProjectionExressionToBatch(expr: string | string[]): Getter {
    if (!this._paramsBatch || !this._paramsBatch.RequestItems) {
      return this;
    }
    if (_.isEmpty(expr)) return this;
    if (_.isString(expr)) {
      if (this._paramsBatch.RequestItems[this._tableName].ProjectionExpression) {
        this._paramsBatch.RequestItems[this._tableName].ProjectionExpression = `${
          this._paramsBatch.RequestItems[this._tableName].ProjectionExpression
        }, ${expr}`;
      } else {
        this._paramsBatch.RequestItems[this._tableName].ProjectionExpression = expr;
      }
    } else if (Array.isArray(expr)) {
      const names: { [key: string]: string } = {};
      const values: string[] = [];
      expr.forEach((key) => {
        names[`#${key}`] = key;
        values.push(`#${key}`);
      });
      const str = values.join(', ');
      if (this._paramsBatch.RequestItems[this._tableName].ProjectionExpression) {
        this._paramsBatch.RequestItems[this._tableName].ProjectionExpression = `${
          this._paramsBatch.RequestItems[this._tableName].ProjectionExpression
        }, ${str}`;
      } else {
        this._paramsBatch.RequestItems[this._tableName].ProjectionExpression = str;
      }
      this._paramsBatch.RequestItems[this._tableName].ExpressionAttributeNames = {
        ...this._paramsBatch.RequestItems[this._tableName].ExpressionAttributeNames,
        ...names
      };
    } else {
      throw new Error(`DbGetter.projection("${expr}" <== must be a string or an array).`);
    }

    return this;
  }
  // for both batch and single get item
  // same as ReturnConsumedCapacity
  public capacity(str: string = ''): Getter {
    const upper = str.toUpperCase();
    const allowed = ['INDEXES', 'TOTAL', 'NONE'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `DbGetter.capacity("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    if (this._paramsItem) {
      this._paramsItem.ReturnConsumedCapacity = upper;
    } else if (this._paramsBatch) {
      this._paramsBatch.ReturnConsumedCapacity = upper;
    }
    return this;
  }
  // used for testing purposes
  public getItemParams(): GetItemCommandInput | undefined {
    return this._paramsItem;
  }
  // used for testing purposes
  public getBatchParams(): BatchGetItemCommandInput | undefined {
    return this._paramsBatch;
  }
  public async execute(): Promise<GetItemCommandOutput | BatchGetItemCommandOutput> {
    if (this._paramsItem && this._paramsBatch) {
      throw new Error('dynamoDBGetterService <== only key() or keys() may be called, not both');
    }

    if (this._paramsItem) {
      return await this._ddb.get(this._paramsItem);
    } else if (this._paramsBatch) {
      return await this._ddb.batchGet(this._paramsBatch);
    }

    throw new Error('dynamoDBGetterService <== neither parameters were initialized');
  }
}

export default Getter;
