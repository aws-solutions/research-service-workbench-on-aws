/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  GetItemCommandInput,
  BatchGetItemCommandInput,
  GetItemCommandOutput,
  BatchGetItemCommandOutput,
  DynamoDB
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import _ from 'lodash';

class Getter {
  private _ddb: DynamoDB;
  private _paramsItem: GetItemCommandInput | undefined;
  private _paramsBatch: BatchGetItemCommandInput | undefined;
  private _tableName: string;

  public constructor(
    config: {
      region: string;
    },
    table: string,
    key: { [key: string]: unknown } | { [key: string]: unknown }[]
  ) {
    this._ddb = new DynamoDB({ ...config });
    this._tableName = table;
    if (Array.isArray(key)) {
      this._paramsBatch = { RequestItems: {} };
      this._paramsBatch.RequestItems = {};
      this._paramsBatch.RequestItems[this._tableName] = { Keys: Object.assign(key.map((k) => marshall(k))) };
    } else {
      this._paramsItem = { TableName: table, Key: marshall(key) };
    }
  }

  /**
   * Sets the TableName value of the command input for GetItem. Currently, this is only supported for single get item commands.
   * This method is not required if the Getter is initialized with a table name.
   *
   * @param name - name of the table containing the requested item
   * @returns Getter with populated params
   */
  public table(name: string): Getter {
    if (!this._paramsItem) {
      throw new Error('Cannot change the table of batch get request after initialization. Start over.');
    }
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`TableName must be a string and can not be empty.`);
    }
    this._paramsItem.TableName = name;
    return this;
  }

  /**
   * Sets the Key value of the command input for GetItem. This is only for single get item commands.
   * This method is not required if the Getter is initialized with a key.
   *
   * @param key - object of the key of the item to get
   * @returns Getter with populated params
   */
  public key(key: { [key: string]: unknown }): Getter {
    if (!this._paramsItem) {
      throw new Error('Cannot use .key() on a batch get request.');
    }
    if (!this._paramsItem.Key) {
      this._paramsItem.Key = {};
    }
    this._paramsItem.Key = marshall(key);
    return this;
  }

  /**
   * Sets the Keys value of the command input for BatchGetItem. This is only for batch get item commands. This method is not required if the Getter is initialized with keys.
   *
   * @param keys - the list of objects of the keys of the items to get
   * @returns Getter with populated params
   */
  public keys(keys: { [key: string]: unknown }[]): Getter {
    if (!this._paramsBatch || !this._paramsBatch.RequestItems) {
      throw new Error('Cannot use .keys() on a single get request.');
    }
    this._paramsBatch.RequestItems[this._tableName].Keys = Object.assign(keys);
    return this;
  }

  /**
   * Sets ConsistentRead to be true for BatchGetItem or GetItem input. If set to true, then the operation uses strongly consistent reads; otherwise, the operation uses eventually consistent reads.
   *
   * @returns Getter with populated params
   */
  public strong(): Getter {
    if (this._paramsItem) {
      this._paramsItem.ConsistentRead = true;
      return this;
    }
    if (this._paramsBatch && this._paramsBatch.RequestItems) {
      this._paramsBatch.RequestItems[this._tableName].ConsistentRead = true;
      return this;
    }
    throw new Error(
      'Neither parameters for single get nor parameters for batch get are initialized. Cannot set ConsistentRead.'
    );
  }

  /**
   * Sets the ExpressionAttributeNames of the command input for BatchGetItem or GetItem.
   * The following are some use cases for using ExpressionAttributeNames:
   *  To access an attribute whose name conflicts with a DynamoDB reserved word: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
   *  To create a placeholder for repeating occurrences of an attribute name in an expression.
   *  To prevent special characters in an attribute name from being misinterpreted in an expression.
   * Use the # character in an expression to dereference an attribute name.
   *
   * @param obj - object of one or more substitution tokens for attribute names in an expression
   * @returns Getter with populated params
   *
   * @example Using the reserved word 'Percentile' in your request
   * ```ts
   * # Usage
   * Getter.names({"#P":"Percentile"}).condition("#P = 50");
   * ```
   */
  public names(obj: { [key: string]: string } = {}): Getter {
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
    throw new Error(
      'Neither parameters for single get nor parameters for batch get are initialized. Cannot set ExpressionAttributeNames.'
    );
  }

  /**
   * Sets ProjectionExpression of the command input for BatchGetItem or GetItem.
   * A string or list of strings that identifies one or more attributes to retrieve from the table.
   * If no attribute names are specified, then all attributes are returned.
   * If any of the requested attributes are not found, they do not appear in the result.
   *
   * @param expr - string or list of strings of the attributes to retrieve
   * @returns Getter with populated params
   */
  public projection(expr: string | string[]): Getter {
    if (this._paramsItem) {
      return this._assignProjectionExressionToSingle(expr);
    }
    return this._assignProjectionExressionToBatch(expr);
  }

  /**
   * Helper method to assign projection expression values to single get item command input.
   *
   * @param expr - string or list of strings of the attributes to retrieve
   * @returns Getter with populated params
   */
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
      throw new Error(`"${expr}" must be a string or an array to generate the projection expression.`);
    }

    return this;
  }

  /**
   * Helper method to assign projection expression values to batch get item command input.
   *
   * @param expr - string or list of strings of the attributes to retrieve
   * @returns Getter with populated params
   */
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
      throw new Error(`"${expr}" must be a string or an array to generate the projection expression.`);
    }

    return this;
  }

  /**
   * Sets the ReturnConsumedCapacity of the command input for BatchGetItem or GetItem.
   * Determines the level of detail about either provisioned or on-demand throughput consumption that is returned in the response:
   *  INDEXES - The response includes the aggregate ConsumedCapacity for the operation, together with ConsumedCapacity for each table and secondary index that was accessed.
   *  TOTAL - The response includes only the aggregate ConsumedCapacity for the operation.
   *  NONE - No ConsumedCapacity details are included in the response.
   *
   * @param str - indexes, total, or none (non case sensitive strings)
   * @returns Getter with populated params
   */
  public capacity(str: 'INDEXES' | 'TOTAL' | 'NONE'): Getter {
    if (this._paramsItem) {
      this._paramsItem.ReturnConsumedCapacity = str;
    } else if (this._paramsBatch) {
      this._paramsBatch.ReturnConsumedCapacity = str;
    }
    return this;
  }

  /**
   * Gets the internal _paramsItems value of the command input. For single get only, obviously.
   *
   * @returns The parameters for the GetItemCommandInput
   *
   * @example Returning command input
   * ```ts
   * # Result
   * {
   *  Key: {},
   *  TableName: string,
   *  ConsistentRead?: boolean,
   *  ExpressionAttributeNames?: {},
   *  ProjectionExpression?: string,
   *  ReturnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE'
   * }
   * ```
   */
  public getItemParams(): GetItemCommandInput | undefined {
    return this._paramsItem;
  }

  /**
   * Gets the internal _paramsBatch value of the command input. For batch get only, obviously.
   *
   * @returns The parameters for the BatchGetItemCommandInput
   *
   * @example Returning command input
   * ```ts
   * # Result
   * {
   *  RequestItems: {
   *    <TableName> : {
   *      Keys: [],
   *      ConsistentRead?: boolean,
   *      ExpressionAttributeNames?: {},
   *      ProjectionExpression?: string
   *    },...
   *  },
   *  ReturnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE'
   * }
   * ```
   */
  public getBatchParams(): BatchGetItemCommandInput | undefined {
    return this._paramsBatch;
  }

  /**
   * Sends the internal parameters as input to the DynamoDB table to execute the GetItem or BatchGetItem request.
   * Call this after populating the command input params with the above methods.
   * Each object in Responses consists of a table name, along with a map of attribute data consisting of the data type and attribute value
   * If UnproccessedKeys is non empty, some request failed.
   * Item/Responses are returned unmarshalled.
   *
   * @returns The output from the get item command or the batch get item command
   *
   * @example GetItemCommandOutput
   * ```ts
   * # Result
   * {
   *  ConsumedCapacity?: [],
   *  Item?: {}
   * }
   * ```
   *
   * @example BatchGetItemCommandOutput
   * ```ts
   * # Result
   * {
   *  ConsumedCapacity?: [],
   *  Responses?: {},
   *  UnprocessedKeys: {}
   * }
   * ```
   *
   */
  public async execute(): Promise<GetItemCommandOutput | BatchGetItemCommandOutput> {
    if (this._paramsItem && this._paramsBatch) {
      throw new Error('Getter <== only key() or keys() may be called, not both');
    }
    let result;
    if (this._paramsItem) {
      result = await this._ddb.getItem(this._paramsItem);
      if (result.Item) {
        result.Item = unmarshall(result.Item);
      }
    } else if (this._paramsBatch) {
      result = await this._ddb.batchGetItem(this._paramsBatch);
      if (result.Responses) {
        // Each object in Responses consists of a table name, along with a map of attribute data consisting of the
        // data type and attribute value. This implementation expects only one table since this._tableName only supports
        // one name.
        // ex. {'sample_table_name': {'L': [obj1, etc] } }
        // Note: unmarshall does not work on the attributes of each object in the list
        result.Responses[this._tableName] = result.Responses[this._tableName].map((item) => unmarshall(item));
      }
    }

    if (result) {
      return result;
    }

    throw new Error('Getter <== neither parameters were initialized');
  }
}

export default Getter;
