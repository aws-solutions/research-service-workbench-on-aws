/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AttributeValue, DeleteItemCommandInput, DeleteItemCommandOutput } from '@aws-sdk/client-dynamodb';
import _ = require('lodash');
import DynamoDB from '../aws/services/dynamoDB';

/**
 * This class helps with deleting a single item from a DDB table.
 */
class Deleter {
  private _ddb: DynamoDB;
  private _params: DeleteItemCommandInput;
  public constructor(options: { region: string; table: string; key: { [key: string]: AttributeValue } }) {
    this._ddb = new DynamoDB({ ...options });
    this._params = { TableName: options.table, Key: options.key };
  }
  public table(name: string): Deleter {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`Deleter.table("${name}" <== must be a string and can not be empty).`);
    }
    this._params.TableName = name;
    return this;
  }
  public key(key: { [key: string]: AttributeValue }): Deleter {
    if (!this._params.Key) {
      this._params.Key = {};
    }
    this._params.Key = key;
    return this;
  }
  // same as ConditionExpression
  public condition(str: string): Deleter {
    if (this._params.ConditionExpression) {
      throw new Error(`Deleter.condition("${str}"), you already called condition() before this call.`);
    }
    this._params.ConditionExpression = str;
    return this;
  }
  // same as ExpressionAttributeNames
  public names(obj: { [key: string]: string } = {}): Deleter {
    if (!_.isObject(obj)) {
      throw new Error(`Deleter.names("${obj}" <== must be an object).`);
    }
    this._params.ExpressionAttributeNames = {
      ...this._params.ExpressionAttributeNames,
      ...obj
    };
    return this;
  }
  // same as ExpressionAttributeValues
  public values(obj: { [key: string]: AttributeValue } = {}): Deleter {
    if (!_.isObject(obj)) {
      throw new Error(`Deleter.values("${obj}" <== must be an object).`);
    }
    this._params.ExpressionAttributeValues = {
      ...this._params.ExpressionAttributeValues,
      ...obj
    };
    return this;
  }
  // same as ReturnValues: NONE | ALL_OLD
  public return(str: string): Deleter {
    const upper = str.toUpperCase();
    const allowed = ['NONE', 'ALL_OLD'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `Deleter.return("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.ReturnValues = upper;
    return this;
  }
  // same as ReturnConsumedCapacity
  public capacity(str: string = ''): Deleter {
    const upper = str.toUpperCase();
    const allowed = ['INDEXES', 'TOTAL', 'NONE'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `Deleter.capacity("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.ReturnConsumedCapacity = upper;
    return this;
  }
  // same as ReturnItemCollectionMetrics
  public metrics(str: string): Deleter {
    const upper = str.toUpperCase();
    const allowed = ['NONE', 'SIZE'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `Deleter.metrics("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.ReturnItemCollectionMetrics = upper;
    return this;
  }
  // for testing purposes
  public getParams(): DeleteItemCommandInput {
    return this._params;
  }
  public async execute(): Promise<DeleteItemCommandOutput> {
    return await this._ddb.delete(this._params);
  }
}

export default Deleter;
