/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AttributeValue,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  DynamoDB
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import _ from 'lodash';

/**
 * This class helps with deleting a single item from a DDB table.
 */
class Deleter {
  private _ddb: DynamoDB;
  private _params: DeleteItemCommandInput;

  public constructor(config: { region: string }, table: string, key: { [key: string]: AttributeValue }) {
    this._ddb = new DynamoDB({ ...config });
    this._params = { TableName: table, Key: key };
  }

  /**
   * Sets the TableName parameter for the command input.
   * This method is not necessary if you provided the table name in the construction of Deleter.
   *
   * @param name - string of the table name to delete from
   * @returns Deleter with populated params
   */
  public table(name: string): Deleter {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`TableName must be a string and can not be empty.`);
    }
    this._params.TableName = name;
    return this;
  }

  /**
   * Sets the Key parameter for the command input.
   * This method is not necessary if you provided the key in the construction of Deleter.
   * For the primary key, you must provide all of the attributes.
   * For example, with a simple primary key, you only need to provide a value for the partition key.
   * For a composite primary key, you must provide values for both the partition key and the sort key.
   *
   * @param key - object of the key of the item to delete
   * @returns Deleter with populated params
   */
  public key(key: { [key: string]: AttributeValue }): Deleter {
    if (!this._params.Key) {
      this._params.Key = {};
    }
    this._params.Key = key;
    return this;
  }

  /**
   * Sets the ConditionExpression of the command input. This condition must be satisfied in order for a condition delete to succeed.
   * An expression can contain any of the following:
   *  Functions: attribute_exists | attribute_not_exists | attribute_type | contains | begins_with | size (These function names are case-sensitive)
   *  Comparison operators: = | \<\> | \< | \> | \<= | \>= | BETWEEN | IN
   *  Logical operators: AND | OR | NOT
   *
   * @param str - string of the condition
   * @returns Deleter with populated params
   *
   * @example Set the condition to delete if an attribute does not exist
   * ```ts
   * # Usage
   * Deleter.condition('attribute_not_exists(DO_NOT_DELETE)');
   * ```
   */
  public condition(str: string): Deleter {
    if (this._params.ConditionExpression) {
      throw new Error(`You already called condition() before .condition(${str}). Cannot set two conditions.`);
    }
    this._params.ConditionExpression = str;
    return this;
  }

  /**
   * Sets the ExpressionAttributeNames of the command input.
   * The following are some use cases for using ExpressionAttributeNames:
   *  To access an attribute whose name conflicts with a DynamoDB reserved word: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
   *  To create a placeholder for repeating occurrences of an attribute name in an expression.
   *  To prevent special characters in an attribute name from being misinterpreted in an expression.
   * Use the # character in an expression to dereference an attribute name.
   *
   * @param obj - object of one or more substitution tokens for attribute names in an expression
   * @returns Deleter with populated params
   *
   * @example Using the reserved word 'Percentile' in your request
   * ```ts
   * # Usage
   * Deleter.names({"#P":"Percentile"}).condition("#P = 50");
   * ```
   */
  public names(obj: { [key: string]: string } = {}): Deleter {
    this._params.ExpressionAttributeNames = {
      ...this._params.ExpressionAttributeNames,
      ...obj
    };
    return this;
  }

  /**
   * Sets the ExpressionAttributeValues of the command input. Use the : (colon) character in an expression to dereference an attribute value.
   *
   * @param obj - object of one or more values that can be substituted in an expression
   * @returns Deleter with populated params
   *
   * @example Conditional delete on status
   * ```ts
   * # Usage
   * Deleter.values({ ":avail":{"S":"Available"}, ":back":{"S":"Backordered"}, ":disc":{"S":"Discontinued"} }).condition('ProductStatus IN (:avail, :back, :disc)');
   * ```
   */
  public values(obj: { [key: string]: AttributeValue } = {}): Deleter {
    this._params.ExpressionAttributeValues = {
      ...this._params.ExpressionAttributeValues,
      ...obj
    };
    return this;
  }

  /**
   * Sets the ReturnValues of the command input. Use ReturnValues if you want to get the item attributes as they appeared before they were deleted.
   * the valid values are:
   *  NONE - If ReturnValues is not specified, or if its value is NONE, then nothing is returned. (This setting is the default for ReturnValues.)
   *  ALL_OLD - The content of the old item is returned.
   *
   * @param str - none or all_old (non case sensitive strings)
   * @returns Deleter with populated params
   */
  public return(str: 'NONE' | 'ALL_OLD'): Deleter {
    this._params.ReturnValues = str;
    return this;
  }

  /**
   * Sets the ReturnConsumedCapacity of the command input. Determines the level of detail about either provisioned or on-demand throughput consumption that is returned in the response:
   *  INDEXES - The response includes the aggregate ConsumedCapacity for the operation, together with ConsumedCapacity for each table and secondary index that was accessed.
   *  TOTAL - The response includes only the aggregate ConsumedCapacity for the operation.
   *  NONE - No ConsumedCapacity details are included in the response.
   *
   * @param str - indexes, total, or none (non case sensitive strings)
   * @returns Deleter with populated params
   */
  public capacity(str: 'INDEXES' | 'TOTAL' | 'NONE'): Deleter {
    this._params.ReturnConsumedCapacity = str;
    return this;
  }

  /**
   * Sets the ReturnItemCollectionMetrics of the command input. Determines whether item collection metrics are returned.
   * If set to SIZE, the response includes statistics about item collections, if any, that were modified during the operation are returned in the response.
   * If set to NONE (the default), no statistics are returned.
   *
   * @param str - size or none (non case sensitive)
   * @returns Deleter with populated params
   */
  public metrics(str: 'NONE' | 'SIZE'): Deleter {
    this._params.ReturnItemCollectionMetrics = str;
    return this;
  }

  /**
   * Gets the internal _params value of the command input. For testing purposes.
   *
   * @returns The parameters for the DeleteItemCommandInput
   *
   * @example Returning command input
   * ```ts
   * # Result
   * {
   *  Key: {},
   *  TableName: '',
   *  ConditionExpression?: string,
   *  ExpressionAttributeNames?: {},
   *  ExpressionAttributeValues?: {},
   *  ReturnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE',
   *  ReturnItemCollectionMetrics?: 'SIZE' | 'NONE',
   *  ReturnValues?: 'NONE' | 'ALL_OLD'
   * }
   * ```
   */
  public getParams(): DeleteItemCommandInput {
    return this._params;
  }

  /**
   * Sends the internal parameters as input to the DynamoDB table to execute the delete request. Call this after populating the command input params with the above methods.
   * Attributes will appear in the response only if ReturnValues=ALL_OLD was set before the command.
   * Attributes are returned unmarshalled.
   *
   * @returns The output from the delete item command
   *
   * @example
   * ```ts
   * # Result
   * {
   *  Attributes?: {}
   *  ConsumedCapacity?: [],
   *  ItemCollectionMetrics?: {}
   * }
   * ```
   */
  public async execute(): Promise<DeleteItemCommandOutput> {
    const result = await this._ddb.deleteItem(this._params);
    if (result.Attributes) {
      result.Attributes = unmarshall(result.Attributes);
    }

    return result;
  }
}

export default Deleter;
