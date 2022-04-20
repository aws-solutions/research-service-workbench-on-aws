/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AttributeValue, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import _ = require('lodash');
import DynamoDB from './aws/services/dynamoDB';

/**
 * This class helps with building queries to a DDB table
 */
class Query {
  private _ddb: DynamoDB;
  private _params: QueryCommandInput;
  private _sortKeyName: string | undefined;
  public constructor(ddb: DynamoDB, table: string) {
    this._ddb = ddb;
    this._params = { TableName: table };
    this._sortKeyName = undefined;
  }
  // same as TableName
  public table(name: string): Query {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`Query.table("${name}" <== must be a non-empty string).`);
    }
    this._params.TableName = name;
    return this;
  }
  // same as IndexName
  public index(name: string): Query {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`Query.index("${name}" <== must be a non empty string and can not be empty).`);
    }
    this._params.IndexName = name;
    return this;
  }
  // helps with setting up KeyConditionExpression
  // this is for the partition key only.  If you also need to specify sort key, then use sortKey() then .eq(), .lt() or .gt(). However,
  // if you use .condition() for the sort key expression, you will need to use values() and possibly names()
  public key(name: string, value: AttributeValue): Query {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`Query.key("${name}" <== must be a string and can not be empty).`);
    }

    const expression = `#${name} = :${name}`;
    this._setCondition(expression);
    this.names({ [`#${name}`]: name });
    this.values({ [`:${name}`]: value });

    return this;
  }
  public sortKey(name: string): Query {
    this._sortKeyName = name;
    this.names({ [`#${name}`]: name });

    return this;
  }
  // helps with setting up KeyConditionExpression
  // this is for the sort key only. It results in an equal expression using the sort key  "#<k> = :<k>". You only want to supply the value of the
  // sort key here since we assume you called .sortKey(name) before calling this one
  public eq(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.eq(), however, you must call Query.sortKey() first.');
    }
    return this._internalExpression('=', value);
  }
  // helps with setting up KeyConditionExpression
  // this is for the sort key only. It results in an less than expression using the sort key  "#<k> < :<k>". You only want to supply the value of the
  // sort key here since we assume you called .sortKey(name) before calling this one
  public lt(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.lt(), however, you must call Query.sortKey() first.');
    }
    return this._internalExpression('<', value);
  }
  // helps with setting up KeyConditionExpression
  // this is for the sort key only. It results in an less than or equal expression using the sort key  "#<k> <= :<k>". You only want to supply the value of the
  // sort key here since we assume you called .sortKey(name) before calling this one
  public lte(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.lte(), however, you must call Query.sortKey() first.');
    }
    return this._internalExpression('<=', value);
  }
  // helps with setting up KeyConditionExpression
  // this is for the sort key only. It results in greater than  expression using the sort key  "#<k> > :<k>". You only want to supply the value of the
  // sort key here since we assume you called .sortKey(name) before calling this one
  public gt(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.gt(), however, you must call Query.sortKey() first.');
    }
    return this._internalExpression('>', value);
  }
  // helps with setting up KeyConditionExpression
  // this is for the sort key only. It results in greater than or equal expression using the sort key  "#<k> >= :<k>". You only want to supply the value of the
  // sort key here since we assume you called .sortKey(name) before calling this one
  public gte(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.gte(), however, you must call Query.sortKey() first.');
    }
    return this._internalExpression('>=', value);
  }
  // helps with setting up KeyConditionExpression
  // this is for the sort key only. It results in the between expression using the sort key  "#<k> BETWEEN :<v1> AND :<v2>". You only want to supply
  // the two between values for the sort key here since we assume you called .sortKey(name) before calling this one
  public between(value1: AttributeValue, value2: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.between(), however, you must call Query.sortKey() first.');
    }
    const expression = `#${this._sortKeyName} BETWEEN :${this._sortKeyName}1 AND :${this._sortKeyName}2`;
    this._setCondition(expression);
    this.values({
      [`:${this._sortKeyName}1`]: value1,
      [`:${this._sortKeyName}2`]: value2
    });
    return this;
  }
  // helps with setting up KeyConditionExpression
  // this is for the sort key only. It results begins_with expression using the sort key  "begins_with( #<k> ,:<k> )". You only want to supply the value of the
  // sort key here since we assume you called .sortKey(name) before calling this one
  public begins(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.begins(), however, you must call Query.sortKey() first.');
    }
    const expression = `begins_with ( #${this._sortKeyName}, :${this._sortKeyName} )`;
    this._setCondition(expression);
    this.values({ [`:${this._sortKeyName}`]: value });
    return this;
  }
  private _internalExpression(expr: string, value: AttributeValue): Query {
    const expression = `#${this._sortKeyName} ${expr} :${this._sortKeyName}`;
    this._setCondition(expression);
    this.values({ [`:${this._sortKeyName}`]: value });
    return this;
  }
  private _setCondition(expression: string): void {
    if (this._params.KeyConditionExpression) {
      this._params.KeyConditionExpression = `${this._params.KeyConditionExpression} AND ${expression}`;
    } else {
      this._params.KeyConditionExpression = expression;
    }
  }
  // same as ExclusiveStartKey
  public start(key: { [key: string]: AttributeValue }): Query {
    if (!key) {
      delete this._params.ExclusiveStartKey;
    } else {
      this._params.ExclusiveStartKey = key;
    }
    return this;
  }
  // same as FilterExpression
  public filter(str: string): Query {
    if (this._params.FilterExpression) {
      this._params.FilterExpression = `${this._params.FilterExpression} ${str}`;
    } else {
      this._params.FilterExpression = str;
    }
    return this;
  }
  // same as ConsistentRead = true
  public strong(): Query {
    this._params.ConsistentRead = true;
    return this;
  }
  // same as ExpressionAttributeNames
  public names(obj: { [key: string]: string } = {}): Query {
    if (!_.isObject(obj)) {
      throw new Error(`Query.names("${obj}" <== must be an object).`);
    }
    this._params.ExpressionAttributeNames = {
      ...this._params.ExpressionAttributeNames,
      ...obj
    };
    return this;
  }
  // same as ExpressionAttributeValues
  public values(obj: { [key: string]: AttributeValue } = {}): Query {
    if (!_.isObject(obj)) {
      throw new Error(`DbQuery.values("${obj}" <== must be an object).`);
    }
    this._params.ExpressionAttributeValues = {
      ...this._params.ExpressionAttributeValues,
      ...obj
    };
    return this;
  }
  // same as ProjectionExpression
  public projection(expr: string | string[]): Query {
    if (_.isEmpty(expr)) return this;
    if (_.isString(expr)) {
      if (this._params.ProjectionExpression) {
        this._params.ProjectionExpression = `${this._params.ProjectionExpression}, ${expr}`;
      } else {
        this._params.ProjectionExpression = expr;
      }
    } else if (Array.isArray(expr)) {
      const names: { [key: string]: string } = {};
      const values: string[] = [];
      expr.forEach((key) => {
        names[`#${key}`] = key;
        values.push(`#${key}`);
      });
      const str = values.join(', ');
      if (this._params.ProjectionExpression) {
        this._params.ProjectionExpression = `${this._params.ProjectionExpression}, ${str}`;
      } else {
        this._params.ProjectionExpression = str;
      }
      this._params.ExpressionAttributeNames = {
        ...this._params.ExpressionAttributeNames,
        ...names
      };
    } else throw new Error(`Query.projection("${expr}" <== must be a string or an array).`);

    return this;
  }
  // same as Select: ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES | SPECIFIC_ATTRIBUTES | COUNT
  public select(str: string): Query {
    const upper = str.toUpperCase();
    const allowed = ['ALL_ATTRIBUTES', 'ALL_PROJECTED_ATTRIBUTES', 'SPECIFIC_ATTRIBUTES', 'COUNT'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `Query.select("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.Select = upper;
    return this;
  }
  // same as Limit
  public limit(num: number): Query {
    this._params.Limit = num;
    return this;
  }
  // same as ScanIndexForward
  public forward(yesOrNo: boolean = true): Query {
    this._params.ScanIndexForward = yesOrNo;
    return this;
  }
  // same as ReturnConsumedCapacity
  public capacity(str: string = ''): Query {
    const upper = str.toUpperCase();
    const allowed = ['INDEXES', 'TOTAL', 'NONE'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `Query.capacity("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.ReturnConsumedCapacity = upper;
    return this;
  }
  public async query(): Promise<QueryCommandOutput> {
    return await this._ddb.query(this._params);
  }
}

class DynamoDBQueryService {
  private _ddb: DynamoDB;
  public query: Query;
  public constructor(options: { region: string; table: string }) {
    this._ddb = new DynamoDB({ ...options });
    this.query = new Query(this._ddb, options.table);
  }
}

export default DynamoDBQueryService;
