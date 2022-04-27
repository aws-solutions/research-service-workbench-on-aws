/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ScanCommandInput, AttributeValue, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import _ = require('lodash');
import DynamoDB from '../aws/services/dynamoDB';

/**
 * This class helps with scans of an entire table in DDB
 */
class Scanner {
  private _ddb: DynamoDB;
  private _params: ScanCommandInput;
  public constructor(options: { region: string; table: string }) {
    this._ddb = new DynamoDB({ ...options });
    this._params = { TableName: options.table };
  }
  // same as TableName
  public table(name: string): Scanner {
    if (_.isEmpty(_.trim(name))) {
      throw new Error(`DbScanner.table("${name}" <== must be a non-empty string).`);
    }
    this._params.TableName = name;
    return this;
  }
  // same as IndexName
  public index(name: string): Scanner {
    if (_.isEmpty(_.trim(name)))
      throw new Error(`DbScanner.index("${name}" <== must be a non-empty string).`);
    this._params.IndexName = name;
    return this;
  }
  // same as ExclusiveStartKey
  public start(key: { [key: string]: AttributeValue }): Scanner {
    // check param type
    if (!key) delete this._params.ExclusiveStartKey;
    else this._params.ExclusiveStartKey = key;
    return this;
  }
  // same as FilterExpression
  public filter(str: string): Scanner {
    if (this._params.FilterExpression)
      this._params.FilterExpression = `${this._params.FilterExpression} ${str}`;
    else this._params.FilterExpression = str;
    return this;
  }
  // same as ConsistentRead = true
  public strong(): Scanner {
    this._params.ConsistentRead = true;
    return this;
  }
  // same as ExpressionAttributeNames
  public names(obj: { [key: string]: string }): Scanner {
    if (!_.isObject(obj)) throw new Error(`DbScanner.names("${obj}" <== must be an object).`);
    this._params.ExpressionAttributeNames = {
      ...this._params.ExpressionAttributeNames,
      ...obj
    };
    return this;
  }
  // same as ExpressionAttributeValues
  public values(obj: { [key: string]: AttributeValue }): Scanner {
    if (!_.isObject(obj)) throw new Error(`DbScanner.values("${obj}" <== must be an object).`);
    this._params.ExpressionAttributeValues = {
      ...this._params.ExpressionAttributeValues,
      ...obj
    };
    return this;
  }
  // same as ProjectionExpression
  public projection(expr: string | string[]): Scanner {
    if (_.isEmpty(expr)) return this;
    if (typeof expr === 'string') {
      if (this._params.ProjectionExpression)
        this._params.ProjectionExpression = `${this._params.ProjectionExpression}, ${expr}`;
      else this._params.ProjectionExpression = expr;
    } else if (Array.isArray(expr)) {
      // type must be string array
      const names: { [key: string]: string } = {};
      const values: string[] = [];
      expr.forEach((key) => {
        names[`#${key}`] = key;
        values.push(`#${key}`);
      });
      const str = values.join(', ');
      if (this._params.ProjectionExpression)
        this._params.ProjectionExpression = `${this._params.ProjectionExpression}, ${str}`;
      else this._params.ProjectionExpression = str;
      this._params.ExpressionAttributeNames = {
        ...this._params.ExpressionAttributeNames,
        ...names
      };
    } else {
      throw new Error(`DbScanner.projection("${expr}" <== must be a string or an array).`);
    }
    return this;
  }
  // same as Select: ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES | SPECIFIC_ATTRIBUTES | COUNT
  public select(str: string): Scanner {
    const upper = str.toUpperCase();
    const allowed = ['ALL_ATTRIBUTES', 'ALL_PROJECTED_ATTRIBUTES', 'SPECIFIC_ATTRIBUTES', 'COUNT'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `DbScanner.select("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.Select = upper;
    return this;
  }
  // same as Limit
  public limit(num: number): Scanner {
    this._params.Limit = num;
    return this;
  }
  // same as Segment
  public segment(num: number): Scanner {
    if (!this._params.TotalSegments) {
      throw new Error('Cannot provide segment without totalSegment. Call .totalSegment() before .segment()');
    }
    this._params.Segment = num;
    return this;
  }
  // same as TotalSegments
  public totalSegment(num: number): Scanner {
    this._params.TotalSegments = num;
    return this;
  }
  // same as ReturnConsumedCapacity
  public capacity(str: string = ''): Scanner {
    const upper = str.toUpperCase();
    const allowed = ['INDEXES', 'TOTAL', 'NONE'];
    if (!allowed.includes(upper)) {
      throw new Error(
        `DbScanner.capacity("${upper}" <== is not a valid value). Only ${allowed.join(',')} are allowed.`
      );
    }
    this._params.ReturnConsumedCapacity = upper;
    return this;
  }
  // for testing purposes
  public getParams(): ScanCommandInput {
    return this._params;
  }
  public async execute(): Promise<ScanCommandOutput> {
    // check either neither or both segment and totalSegments are defined (XOR)
    //( foo || bar ) && !( foo && bar )
    if (
      !(_.isUndefined(this._params.Segment) && _.isUndefined(this._params.TotalSegments)) &&
      (_.isUndefined(this._params.Segment) || _.isUndefined(this._params.TotalSegments))
    ) {
      throw new Error('Must declare both Segment and TotalSegment if using either.');
    }
    return await this._ddb.scan(this._params);
  }
}

export default Scanner;
