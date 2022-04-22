/* eslint-disable security/detect-object-injection */
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AttributeValue, UpdateItemCommandInput, UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb';
import _ = require('lodash');
import DynamoDB from './aws/services/dynamoDB';

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
  public constructor(ddb: DynamoDB, table: string, key: { [key: string]: AttributeValue }) {
    this._ddb = ddb;
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
  public table(name: string): Updater {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`Updater.table("${name}" <== must be a string and can not be empty).`);
    }
    this._params.TableName = name;
    return this;
  }
  // mark the provided attribute names as being of type Set
  public mark(arr: string[] = []): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.mark() after you called DbUpdater.update(). Call mark() before calling update().'
      );
    }
    arr.forEach((key) => {
      this._marked[key] = true;
    });
    return this;
  }
  public key(key: { [key: string]: AttributeValue }): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.key() after you called DbUpdater.update(). Call key() before calling update().'
      );
    }
    if (!this._params.Key) {
      this._params.Key = {};
    }
    this._params.Key = key;
    return this;
  }
  public disableCreatedAt(): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.disableCreatedAt() after you called DbUpdater.update(). Call disableCreatedAt() before calling update().'
      );
    }
    this._createdAtState.enabled = false;
    return this;
  }
  public createdAt(str: string | Date): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.createdAt() after you called DbUpdater.update(). Call createdAt() before calling update().'
      );
    }
    if (!_.isDate(str) && (!_.isString(str) || _.isEmpty(_.trim(str)))) {
      throw new Error(`Updater.createdAt("${str}" <== must be a string or Date and can not be empty).`);
    }
    this._createdAtState.enabled = true;
    this._createdAtState.value = _.isDate(str) ? str.toISOString() : str;
    return this;
  }
  public disableUpdatedAt(): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.disableUpdatedAt() after you called DbUpdater.update(). Call disableUpdatedAt() before calling update().'
      );
    }
    this._updatedAtState.enabled = false;
    return this;
  }
  public updatedAt(str: string | Date): Updater {
    if (this._params.UpdateExpression) {
      throw new Error(
        'You tried to call Updater.updatedAt() after you called DbUpdater.update(). Call updatedAt() before calling update().'
      );
    }
    if (!_.isDate(str) && (!_.isString(str) || _.isEmpty(_.trim(str)))) {
      throw new Error(`Updater.updatedAt("${str}" <== must be a string or Date and can not be empty).`);
    }
    this._updatedAtState.enabled = true;
    this._updatedAtState.value = _.isDate(str) ? str.toISOString() : str;
    return this;
  }
  // this is an additional method that helps us with using the optimistic locking technique, if you use this method,
  // you NO longer need to add the 'and #rev = :rev' and 'SET #rev = #rev + :_addOne' expressions
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
  // helps with setting up UpdateExpression
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

      if (this._createdAtState.enabled && key === 'createdAt') return;
      if (this._updatedAtState.enabled && key === 'updatedAt') return;
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

    let createdAt = this._createdAtState.value;
    if (this._createdAtState.enabled && !this._createdAtState.processed) {
      this._createdAtState.processed = true;
      createdAt = _.isEmpty(createdAt) ? new Date().toISOString() : createdAt;
      this._internals.set.push('#createdAt = if_not_exists(#createdAt, :createdAt)');
      names['#createdAt'] = 'createdAt';
      values[':createdAt'] = { S: createdAt };
    }

    let updatedAt = this._updatedAtState.value;
    if (this._updatedAtState.enabled && !this._updatedAtState.processed) {
      this._updatedAtState.processed = true;
      updatedAt = _.isEmpty(updatedAt) ? new Date().toISOString() : updatedAt;
      this._internals.set.push('#updatedAt = :updatedAt');
      names['#updatedAt'] = 'updatedAt';
      values[':updatedAt'] = { S: updatedAt };
    }

    this.names(names);
    this.values(values);

    return this;
  }
  // replaces an old SDK V1 built in method
  private _createSet(value: string[]): AttributeValue {
    return { SS: value };
  }
  // same as using UpdateExpression with the SET clause. IMPORTANT: your expression should NOT include the 'SET' keyword
  public set(expression: string): Updater {
    if (!_.isEmpty(expression)) {
      this._internals.set.push(expression);
    }
    return this;
  }
  // same as using UpdateExpression with the ADD clause. IMPORTANT: your expression should NOT include the 'ADD' keyword
  public add(expression: string): Updater {
    if (!_.isEmpty(expression)) {
      this._internals.add.push(expression);
    }
    return this;
  }
  // same as using UpdateExpression with the REMOVE clause. IMPORTANT: your expression should NOT include the 'REMOVE' keyword
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
  // same as using UpdateExpression with the DELETE clause. IMPORTANT: your expression should NOT include the 'DELETE' keyword
  public delete(expression: string): Updater {
    if (!_.isEmpty(expression)) {
      this._internals.delete.push(expression);
    }
    return this;
  }
  // same as ExpressionAttributeNames
  public names(obj: { [key: string]: string } = {}): Updater {
    if (!_.isObject(obj)) {
      throw new Error(`DbUpdater.names("${obj}" <== must be an object).`);
    }
    this._params.ExpressionAttributeNames = {
      ...this._params.ExpressionAttributeNames,
      ...obj
    };
    return this;
  }
  // same as ExpressionAttributeValues
  public values(obj: { [key: string]: AttributeValue } = {}): Updater {
    if (!_.isObject(obj)) {
      throw new Error(`DbScanner.values("${obj}" <== must be an object).`);
    }
    this._params.ExpressionAttributeValues = {
      ...this._params.ExpressionAttributeValues,
      ...obj
    };
    return this;
  }
  // same as ConditionExpression
  public condition(str: string, separator: string = 'AND'): Updater {
    if (!_.isString(str) || _.isEmpty(_.trim(str))) {
      throw new Error(`DbUpdater.condition("${str}" <== must be a string and can not be empty).`);
    }
    this._internals.setConditionExpression(str, separator);
    return this;
  }
  // same as ReturnValues: NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,
  public return(str: string): Updater {
    const upper = str.toUpperCase();
    const allowed = ['NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `DbUpdater.return("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.ReturnValues = upper;
    return this;
  }
  // same as ReturnItemCollectionMetrics
  public metrics(str: string): Updater {
    const upper = str.toUpperCase();
    const allowed = ['NONE', 'SIZE'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `DbUpdater.metrics("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.ReturnItemCollectionMetrics = upper;
    return this;
  }
  // same as ReturnConsumedCapacity
  public capacity(str: string = ''): Updater {
    const upper = str.toUpperCase();
    const allowed = ['INDEXES', 'TOTAL', 'NONE'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `DbUpdater.capacity("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.ReturnConsumedCapacity = upper;
    return this;
  }
  public async update(): Promise<UpdateItemCommandOutput> {
    return await this._ddb.update(this._internals.toParams());
  }
}

class DynamoDBUpdaterService {
  private _ddb: DynamoDB;
  public updater: Updater;
  public constructor(options: { region: string; table: string; key: { [key: string]: AttributeValue } }) {
    this._ddb = new DynamoDB({ ...options });
    this.updater = new Updater(this._ddb, options.table, options.key);
  }
}

export default DynamoDBUpdaterService;
