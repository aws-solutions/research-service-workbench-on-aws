/* eslint-disable security/detect-object-injection */
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AttributeValue,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
  DynamoDB
} from '@aws-sdk/client-dynamodb';
import _ from 'lodash';

/**
 * This class helps with writes or updates to single items in DDB
 */
class Updater {
  private _ddb: DynamoDB;
  private _params: UpdateItemCommandInput;
  private _marked: { [key: string]: boolean };
  private _createdAtState: { enabled: boolean; processed: boolean; value: string };
  private _updatedAtState: { enabled: boolean; processed: boolean; value: string };
  private _internals: {
    set: string[];
    add: string[];
    remove: string[];
    delete: string[];
    revGiven: boolean;
    setConditionExpression: (expr: string, seperator?: string) => void;
    toParams: () => UpdateItemCommandInput;
  };

  public constructor(config: { region: string }, table: string, key: { [key: string]: AttributeValue }) {
    this._ddb = new DynamoDB({ ...config });
    this._params = { TableName: table, Key: key, ReturnValues: 'ALL_NEW' };
    this._marked = {};
    this._createdAtState = { enabled: true, processed: false, value: '' };
    this._updatedAtState = { enabled: true, processed: false, value: '' };

    const self = this;
    this._internals = {
      set: [],
      add: [],
      remove: [],
      delete: [],
      revGiven: false,
      setConditionExpression: (expr: string, separator: string = 'AND') => {
        if (self._params.ConditionExpression)
          self._params.ConditionExpression = `${self._params.ConditionExpression} ${separator} ${expr}`;
        else self._params.ConditionExpression = expr;
      },
      toParams() {
        const updates: string[] = [];
        if (!_.isEmpty(this.set)) updates.push(`SET ${this.set.join(', ')}`);
        if (!_.isEmpty(this.add)) updates.push(`ADD ${this.add.join(', ')}`);
        if (!_.isEmpty(this.remove)) updates.push(`REMOVE ${this.remove.join(', ')}`);
        if (!_.isEmpty(this.delete)) updates.push(`DELETE ${this.delete.join(', ')}`);

        delete self._params.UpdateExpression;
        if (_.isEmpty(updates)) return self._params;
        self._params.UpdateExpression = updates.join(' ');
        return self._params;
      }
    };
  }

  /**
   * Sets the TableName parameter for the command input.
   * This method is not necessary if you provided the table name in the construction of Scanner.
   *
   * @param name - string of the table name to update on
   * @returns Updater with populated params
   */
  public table(name: string): Updater {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`TableName must be a string and can not be empty.`);
    }
    this._params.TableName = name;
    return this;
  }

  /**
   * Marks the provided attribute names as being of type Set.
   * This is used during the final conversion of internal params to the command input.
   *
   * @param arr - list of attribute names to mark
   * @returns Updater with populated params
   */
  // mark the provided attribute names as being of type Set
  public mark(arr: string[] = []): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.mark() after you called Updater.execute(). Call mark() before calling execute().'
      );
    }
    arr.forEach((key) => {
      this._marked[key] = true;
    });
    return this;
  }

  /**
   * Sets the Key value of the command input. This method is not required if the Updater is initialized with a key.
   *
   * @param key - object of the key of the item to update
   * @returns Updater with populated params
   */
  public key(key: { [key: string]: AttributeValue }): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.key() after you called Updater.execute(). Call key() before calling execute().'
      );
    }
    if (!this._params.Key) {
      this._params.Key = {};
    }
    this._params.Key = key;
    return this;
  }

  /**
   * Helper method to mark you don't want to update the createdAt attribute of the item you are updating.
   *
   * @returns Updater with populated params
   */
  public disableCreatedAt(): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.disableCreatedAt() after you called Updater.execute(). Call disableCreatedAt() before calling execute().'
      );
    }
    this._createdAtState.enabled = false;
    return this;
  }

  /**
   * Helper method to set the createdAt timespace of the item you are creating.
   *
   * @param str - string or Date to assign to createdAt attribute
   * @returns Updater with populated params
   */
  public createdAt(str: string | Date): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.createdAt() after you called Updater.execute(). Call createdAt() before calling execute().'
      );
    }
    if (!_.isDate(str) && (!_.isString(str) || _.isEmpty(_.trim(str)))) {
      throw new Error(
        `"${str}" <== must be a string or Date and can not be empty to assign to createdAt attribute.`
      );
    }
    this._createdAtState.enabled = true;
    this._createdAtState.value = _.isDate(str) ? str.toISOString() : str;
    return this;
  }

  /**
   * Helper method to mark you don't want to update the updatedAt attribute of the item you are updating.
   *
   * @returns Updater with populated params
   */
  public disableUpdatedAt(): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.disableUpdatedAt() after you called Updater.execute(). Call disableUpdatedAt() before calling execute().'
      );
    }
    this._updatedAtState.enabled = false;
    return this;
  }

  /**
   * Helper method to set the updatedAt timestamp of the item you are updating.
   *
   * @param str - string or Date to assign to updatedAt attribute
   * @returns Updater with populated params
   */
  public updatedAt(str: string | Date): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.updatedAt() after you called Updater.execute(). Call updatedAt() before calling execute().'
      );
    }
    if (!_.isDate(str) && (!_.isString(str) || _.isEmpty(_.trim(str)))) {
      throw new Error(
        `"${str}" <== must be a string or Date and can not be empty to assign to updatedAt attribute.`
      );
    }
    this._updatedAtState.enabled = true;
    this._updatedAtState.value = _.isDate(str) ? str.toISOString() : str;
    return this;
  }

  /**
   * This is an additional method that helps us with using the optimistic locking technique. If you use this method,
   * you NO longer need to add the 'and #rev = :rev' and 'SET #rev = #rev + :_addOne' expressions
   *
   * @param rev - number of the rev to save
   * @returns Updated with populated params
   */
  public rev(rev: number): Updater {
    if (_.isNil(rev)) return this;
    const expression = '#rev = :rev';
    this._internals.setConditionExpression(expression);
    this._internals.revGiven = true;
    this.names({ '#rev': 'rev' });
    this.values({ ':rev': { N: `${rev}` }, ':_addOne': { N: '1' } });
    this._internals.set.push('#rev = #rev + :_addOne');

    return this;
  }

  /**
   * This is the recommended method for adding new items or updating existing items.
   * Pass the new item or the various new attribute names and/or new attribte values of an existing item.
   *
   * @param item - object of a new item or new values for an existing item
   * @returns Updater with populated params
   */
  public item(item: { [key: string]: AttributeValue }): Updater {
    if (!item) return this;

    // we loop through all the properties that are defined and add them to the
    // update expression and to the expression values and that same time detect if they are marked as sets
    const keys = Object.keys(item);
    if (keys.length === 0) return this;

    const assignments: string[] = [];
    const values: { [key: string]: AttributeValue } = {};
    const names: { [key: string]: string } = {};

    keys.forEach((key) => {
      const value = item[key];
      if (value === undefined) return;
      if (this._params.Key && this._params.Key.hasOwnProperty(key)) return; // eslint-disable-line no-prototype-builtins

      if (this._internals.revGiven && key === 'rev') return;

      names[`#${key}`] = key;
      assignments.push(`#${key} = :${key}`);

      if (this._marked[key] && _.isEmpty(value)) {
        values[`:${key}`] = { NULL: true };
      } else {
        values[`:${key}`] = value;
      }
    });

    if (assignments.length === 0) return this;

    this._internals.set.push(assignments.join(', '));

    const shouldAddCreatedAt =
      this._createdAtState.enabled && !this._createdAtState.processed && !item.hasOwnProperty('createdAt');
    if (shouldAddCreatedAt) {
      this._createdAtState.processed = true;
      const createdAt = _.isEmpty(this._createdAtState.value)
        ? new Date().toISOString()
        : this._createdAtState.value;
      this._internals.set.push('#createdAt = if_not_exists(#createdAt, :createdAt)');
      names['#createdAt'] = 'createdAt';
      values[':createdAt'] = { S: createdAt };
    }

    const shouldAddUpdatedAt =
      this._updatedAtState.enabled && !this._updatedAtState.processed && !item.hasOwnProperty('updatedAt');
    if (shouldAddUpdatedAt) {
      this._updatedAtState.processed = true;
      const updatedAt = _.isEmpty(this._updatedAtState.value)
        ? new Date().toISOString()
        : this._updatedAtState.value;
      this._internals.set.push('#updatedAt = :updatedAt');
      names['#updatedAt'] = 'updatedAt';
      values[':updatedAt'] = { S: updatedAt };
    }

    this.names(names);
    this.values(values);

    return this;
  }

  /**
   * Same as using UpdateExpression with the SET clause to set the UpdateExpression parameter of the command input.
   * IMPORTANT: your expression should NOT include the 'SET' keyword
   *
   * @param expression - string to update
   * @returns Updater with populated params
   *
   * @example Set a new attribute to be a new value
   * ```ts
   * # Usage
   * Updater.names({ '#newAttribute': 'newAttribute' }).values({ ':newValue': { S: 'newValue' } }).set('#newAttribute = :newValue')
   * ```
   */
  public set(expression: string): Updater {
    if (!_.isEmpty(expression)) {
      this._internals.set.push(expression);
    }
    return this;
  }

  /**
   * Same as using UpdateExpression with the ADD clause to set the UpdateExpression parameter of the command input.
   * IMPORTANT: your expression should NOT include the 'ADD' keyword
   * Use to add a number to a numerical attribute, add a new attribute, or add an element to a set
   *
   * @param expression - string to update
   * @returns Updater with populated params
   *
   * @example Add newValye to myNum
   * ```ts
   * # Usage
   * Updater.names({ '#myNum': 'myNum' }).values({ ':newValue': { S: 'newValue' } }).add('#myNum :newValue')
   * ```
   */
  public add(expression: string): Updater {
    if (!_.isEmpty(expression)) {
      this._internals.add.push(expression);
    }
    return this;
  }

  /**
   * Same as using UpdateExpression with the REMOVE clause to set the UpdateExpression parameter of the command input.
   * IMPORTANT: your expression should NOT include the 'REMOVE' keyword
   * Use to remove attribute(s) from an item that exists
   *
   * @param expression - string to update
   * @returns Updater with populated params
   *
   * @example Remove attributeToRemove
   * ```ts
   * # Usage
   * Updater.names({ '#attributeToRemove': 'attributeToRemove' }).remove('#attributeToRemove')
   * ```
   */
  public remove(expression: string | string[]): Updater {
    if (!_.isEmpty(expression)) {
      if (_.isArray(expression)) {
        this._internals.remove.push(...expression);
      } else {
        this._internals.remove.push(expression);
      }
    }
    return this;
  }

  /**
   * Same as using UpdateExpression with the DELETE clause to set the UpdateExpression parameter of the command input.
   * IMPORTANT: your expression should NOT include the 'DELETE' keyword
   * Use to delete an item from a set that is the value of an attribute
   *
   * @param expression - string to update
   * @returns Updater with populated params
   *
   * @example Remove attributeToRemove
   * ```ts
   * # Usage
   * Updater.names({ '#itemToDeleteFrom': 'itemToDeleteFrom' }).values({ ':itemToDelete': { S: 'itemToDelete' } }).delete('#itemToDeleteFrom :itemToDelete')
   * ```
   */
  public delete(expression: string): Updater {
    if (!_.isEmpty(expression)) {
      this._internals.delete.push(expression);
    }
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
   * @returns Updater with populated params
   *
   * @example Using the reserved word 'Percentile' in your request
   * ```ts
   * # Usage
   * Updater.names({"#P":"Percentile"}).condition("#P = 50");
   * ```
   */
  public names(obj: { [key: string]: string } = {}): Updater {
    this._params.ExpressionAttributeNames = {
      ...this._params.ExpressionAttributeNames,
      ...obj
    };
    return this;
  }

  /**
   * Sets the ExpressionAttributeValues of the command input.
   * Use the : (colon) character in an expression to dereference an attribute value.
   *
   * @param obj - object of one or more values that can be substituted in an expression
   * @returns Updater with populated params
   *
   * @example Conditional update on status
   * ```ts
   * # Usage
   * Updater.values({ ":avail":{"S":"Available"}, ":back":{"S":"Backordered"}, ":disc":{"S":"Discontinued"} }).condition('ProductStatus IN (:avail, :back, :disc)');
   * ```
   */
  public values(obj: { [key: string]: AttributeValue } = {}): Updater {
    this._params.ExpressionAttributeValues = {
      ...this._params.ExpressionAttributeValues,
      ...obj
    };
    return this;
  }

  /**
   * Sets the ConditionExpression of the command input. This condition must be satisfied in order for a condition update to succeed.
   * An expression can contain any of the following:
   *  Functions: attribute_exists | attribute_not_exists | attribute_type | contains | begins_with | size (These function names ARE case-sensitive)
   *  Comparison operators: = | \<\> | \< | \> | \<= | \>= | BETWEEN | IN
   *  Logical operators: AND | OR | NOT
   *
   * @param str - string of the condition
   * @returns Updater with populated params
   *
   * @example Set the condition to update if an attribute does not exist
   * ```ts
   * # Usage
   * Udpater.condition('attribute_not_exists(newAttribute)');
   * ```
   */
  public condition(str: string, separator: string = 'AND'): Updater {
    if (!_.isString(str) || _.isEmpty(_.trim(str))) {
      throw new Error(`Condition cannot be empty`);
    }
    this._internals.setConditionExpression(str, separator);
    return this;
  }

  /**
   * Sets the ReturnValues parameter of the command input.
   * Use ReturnValues if you want to get the item attributes as they appear before or after they are updated.
   * For UpdateItem, the valid values are:
   *  NONE - If ReturnValues is not specified, or if its value is NONE, then nothing is returned. (This setting is the default for ReturnValues.)
   *  ALL_OLD - Returns all of the attributes of the item, as they appeared before the UpdateItem operation.
   *  UPDATED_OLD - Returns only the updated attributes, as they appeared before the UpdateItem operation.
   *  ALL_NEW - Returns all of the attributes of the item, as they appear after the UpdateItem operation.
   *  UPDATED_NEW - Returns only the updated attributes, as they appear after the UpdateItem operation.
   *
   * @param str - NONE, ALL_OLD, UPDATED_OLD, ALL_NEW, or UPDATED_NEW (not case sensitive)
   * @returns Updater with populated params
   */
  public return(str: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW'): Updater {
    this._params.ReturnValues = str;
    return this;
  }

  /**
   * Sets the ReturnItemCollectionMetrics of the command input. Determines whether item collection metrics are returned.
   * If set to SIZE, the response includes statistics about item collections, if any, that were modified during the operation are returned in the response.
   * If set to NONE (the default), no statistics are returned.
   *
   * @param str - size or none (non case sensitive)
   * @returns Updater with populated params
   */
  // same as ReturnItemCollectionMetrics
  public metrics(str: 'NONE' | 'SIZE'): Updater {
    this._params.ReturnItemCollectionMetrics = str;
    return this;
  }

  /**
   * Sets the ReturnConsumedCapacity of the command input. Determines the level of detail about either provisioned or on-demand throughput consumption that is returned in the response:
   *  INDEXES - The response includes the aggregate ConsumedCapacity for the operation, together with ConsumedCapacity for each table and secondary index that was accessed.
   *  TOTAL - The response includes only the aggregate ConsumedCapacity for the operation.
   *  NONE - No ConsumedCapacity details are included in the response.
   *
   * @param str - indexes, total, or none (non case sensitive strings)
   * @returns Updater with populated params
   */
  // same as ReturnConsumedCapacity
  public capacity(str: 'INDEXES' | 'TOTAL' | 'NONE'): Updater {
    this._params.ReturnConsumedCapacity = str;
    return this;
  }

  /**
   * Gets the internal _params value of the command input. For testing purposes.
   *
   * @returns The parameters for the UpdateItemCommandInput
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
   *  ReturnValues?: 'NONE' |'ALL_OLD' |'UPDATED_OLD' |'ALL_NEW' | 'UPDATED_NEW',
   *  UpdateExpression?: string,
   * }
   * ```
   */
  public getParams(): UpdateItemCommandInput {
    return this._internals.toParams();
  }

  /**
   * Sends the internal parameters as input to the DynamoDB table to execute the update item request. Call this after populating the command input params with the above methods.
   * Attributes will appear in the response only if ReturnValues does not equal NONE was set before the command.
   * Attributes are returned unmarshalled.
   *
   * @returns The output from the update item command
   *
   * @example
   * ```ts
   * # Result
   * {
   *  Attributes?: {}
   *  ConsumedCapacity?: [],
   *  ItemCollectionMetrics?: {}
   * /}
   * ```
   */
  public async execute(): Promise<UpdateItemCommandOutput> {
    return this._ddb.updateItem(this._internals.toParams());
  }
}

export default Updater;
