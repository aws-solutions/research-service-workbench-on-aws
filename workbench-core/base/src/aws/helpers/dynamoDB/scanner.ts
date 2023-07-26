/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ScanCommandInput, AttributeValue, ScanCommandOutput, DynamoDB } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import _ from 'lodash';

/**
 * This class helps with scans of an entire table in DDB
 */
class Scanner {
  private _ddb: DynamoDB;
  private _params: ScanCommandInput;

  public constructor(config: { region: string }, table: string) {
    this._ddb = new DynamoDB({ ...config });
    this._params = { TableName: table };
  }

  /**
   * Sets the TableName parameter for the command input.
   * This method is not necessary if you provided the table name in the construction of Scanner.
   *
   * @param name - string of the table name to scan on
   * @returns Scanner with populated params
   */
  public table(name: string): Scanner {
    if (_.isEmpty(_.trim(name))) {
      throw new Error(`TableName must be a string and can not be empty.`);
    }
    this._params.TableName = name;
    return this;
  }

  /**
   * Sets the IndexName parameter for the command input.
   *
   * @param name - string of the index name to scan on
   * @returns Scanner with populated params
   */
  public index(name: string): Scanner {
    if (_.isEmpty(_.trim(name))) {
      throw new Error(`IndexName must be a string and can not be empty.`);
    }
    this._params.IndexName = name;
    return this;
  }

  /**
   * Sets the ExclusiveStartKey parameter for the command input.
   * Use for pagination by providing the LastEvaluatedKey in the previous request as the ExclusiveStartKey in the new request.
   *
   * @param key - primary key of the element to start with (exclusive) in a scan
   * @returns Scanner with populated params
   */
  public start(key: { [key: string]: AttributeValue }): Scanner {
    // check param type
    if (!key) delete this._params.ExclusiveStartKey;
    else this._params.ExclusiveStartKey = key;
    return this;
  }

  /**
   * Sets the FilterExpression parameter of the command input.
   * Items that do not satisfy the FilterExpression criteria are not returned.
   * A FilterExpression does not allow key attributes. You cannot define a filter expression based on a partition key or a sort key.
   * A FilterExpression is applied after the items have already been read; the process of filtering does not consume any additional read capacity units.
   * Filter expressions can use the same comparators, functions, and logical operators as a key condition expression, with the addition of the not-equals operator (\<\>), the OR operator, the CONTAINS operator, the IN operator, and the BEGINS_WITH operator.
   *
   * @param str - a string that contains conditions that DynamoDB applies after the Scan operation, but before the data is returned to you
   * @returns Scanner with populated params
   *
   * @example Filtering on items that do not have the latest attribute
   * ```ts
   * # Usage
   * Scanner.filter('attribute_not_exists(latest))
   * ```
   */
  public filter(str: string): Scanner {
    if (this._params.FilterExpression)
      this._params.FilterExpression = `${this._params.FilterExpression} ${str}`;
    else this._params.FilterExpression = str;
    return this;
  }

  /**
   * Sets ConsistentRead to be true for command input.
   * If set to true, then the operation uses strongly consistent reads; otherwise, the operation uses eventually consistent reads.
   *
   * @returns Scanner with populated params
   */
  public strong(): Scanner {
    this._params.ConsistentRead = true;
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
   * @returns Scanner with populated params
   *
   * @example Using the reserved word 'Percentile' in your request
   * ```ts
   * # Usage
   * Scanner.names({"#P":"Percentile"}).condition("#P = 50");
   * ```
   */
  public names(obj: { [key: string]: string }): Scanner {
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
   * @returns Scanner with populated params
   *
   * @example Filtered scan on status
   * ```ts
   * # Usage
   * Scanner.values({ ":avail":{"S":"Available"}, ":back":{"S":"Backordered"}, ":disc":{"S":"Discontinued"} }).filter('ProductStatus IN (:avail, :back, :disc)');
   * ```
   */
  public values(obj: { [key: string]: AttributeValue }): Scanner {
    this._params.ExpressionAttributeValues = {
      ...this._params.ExpressionAttributeValues,
      ...obj
    };
    return this;
  }

  /**
   * Sets ProjectionExpression of the command input.
   * A string or list of strings that identifies one or more attributes to retrieve from the table.
   * If no attribute names are specified, then all attributes are returned.
   * If any of the requested attributes are not found, they do not appear in the result.
   *
   * @param expr - string or list of strings of the attributes to retrieve
   * @returns Scanner with populated params
   */
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
      throw new Error(`"${expr}" must be a string or an array to generate the projection expression.`);
    }
    return this;
  }

  /**
   * Sets the Select parameter of the command input. The valid values are:
   *  ALL_ATTRIBUTES - Returns all of the item attributes from the specified table or index. If you query a local secondary index, then for each matching item in the index, DynamoDB fetches the entire item from the parent table. If the index is configured to project all item attributes, then all of the data can be obtained from the local secondary index, and no fetching is required.
   *  ALL_PROJECTED_ATTRIBUTES - Allowed only when querying an index. Retrieves all attributes that have been projected into the index. If the index is configured to project all attributes, this return value is equivalent to specifying ALL_ATTRIBUTES.
   *  COUNT - Returns the number of matching items, rather than the matching items themselves.
   *  SPECIFIC_ATTRIBUTES - Returns only the attributes listed in AttributesToGet. This return value is equivalent to specifying AttributesToGet without specifying any value for Select.
   * If you query or scan a local secondary index and request only attributes that are projected into that index, the operation will read only the index and not the table.
   * If any of the requested attributes are not projected into the local secondary index, DynamoDB fetches each of these attributes from the parent table.
   * This extra fetching incurs additional throughput cost and latency.
   * If you query or scan a global secondary index, you can only request attributes that are projected into the index.
   * Global secondary index queries cannot fetch attributes from the parent table.
   * If neither Select nor AttributesToGet are specified, DynamoDB defaults to ALL_ATTRIBUTES when accessing a table, and ALL_PROJECTED_ATTRIBUTES when accessing an index.
   * If you use the ProjectionExpression parameter, then the value for Select can only be SPECIFIC_ATTRIBUTES.
   * Any other value for Select will return an error.
   *
   * @param str - ALL_ATTRIBUTES, ALL_PROJECTED_ATTRIBUTES, SPECIFIC_ATTRIBUTES, or COUNT (not case sensitive)
   * @returns Scanner with populated params
   */
  public select(
    str: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT'
  ): Scanner {
    this._params.Select = str;
    return this;
  }

  /**
   * Sets the Limit parameter of the command input.
   * If DynamoDB processes the number of items up to the limit while processing the results, it stops the operation and returns the matching values up to that point, and a key in LastEvaluatedKey to apply in a subsequent operation, so that you can pick up where you left off.
   * Also, if the processed dataset size exceeds 1 MB before DynamoDB reaches this limit, it stops the operation and returns the matching values up to the limit, and a key in LastEvaluatedKey to apply in a subsequent operation to continue the operation.
   *
   * @param num - the maximum number of items to evaluate (not necessarily the number of matching items)
   * @returns Scan with populated params
   */
  public limit(num: number): Scanner {
    this._params.Limit = num;
    return this;
  }

  /**
   * Sets the Segment parameter of the command input.
   * For a parallel Scan request, Segment identifies an individual segment to be scanned by an application worker.
   * Segment IDs are zero-based, so the first segment is always 0.
   * For example, if you want to use four application threads to scan a table or an index, then the first thread specifies a Segment value of 0, the second thread specifies 1, and so on.
   * The value for Segment must be greater than or equal to 0, and less than the value provided for TotalSegments.
   * If you provide Segment, you must also provide TotalSegments. You must call .totalSegment() before .segment()
   *
   * @param num - number thread to use
   * @returns Scanner with populated params
   */
  public segment(num: number): Scanner {
    if (!this._params.TotalSegments) {
      throw new Error('Cannot provide segment without totalSegment. Call .totalSegment() before .segment()');
    }
    this._params.Segment = num;
    return this;
  }

  /**
   * Sets the TotalSegments parameter of the command input.
   * For a parallel Scan request, TotalSegments represents the total number of segments into which the Scan operation will be divided.
   * The value of TotalSegments corresponds to the number of application workers that will perform the parallel scan.
   * For example, if you want to use four application threads to scan a table or an index, specify a TotalSegments value of 4.
   * The value for TotalSegments must be greater than or equal to 1, and less than or equal to 1000000. If you specify a TotalSegments value of 1, the Scan operation will be sequential rather than parallel.
   * If you specify TotalSegments, you must also specify Segment. You must call .totalSegment() before .segment().
   *
   * @param num - total number of parallel threads to use
   * @returns Scanner with populated params
   */
  public totalSegment(num: number): Scanner {
    this._params.TotalSegments = num;
    return this;
  }

  /**
   * Sets the ReturnConsumedCapacity of the command input.
   * Determines the level of detail about either provisioned or on-demand throughput consumption that is returned in the response:
   *  INDEXES - The response includes the aggregate ConsumedCapacity for the operation, together with ConsumedCapacity for each table and secondary index that was accessed.
   *  TOTAL - The response includes only the aggregate ConsumedCapacity for the operation.
   *  NONE - No ConsumedCapacity details are included in the response.
   *
   * @param str - indexes, total, or none (non case sensitive strings)
   * @returns Scanner with populated params
   */
  public capacity(str: 'INDEXES' | 'TOTAL' | 'NONE'): Scanner {
    this._params.ReturnConsumedCapacity = str;
    return this;
  }

  /**
   * Gets the internal _params value of the command input. Used for testing purposes.
   *
   * @returns The parameters for the ScanCommandInput
   *
   * @example Returning command input
   * ```ts
   * # Result
   * {
   *  TableName: string,
   *  ConsistenRead?: boolean,
   *  ExclusiveStartKey?: {},
   *  ExpressionAttributeNames?: {},
   *  ExpressionAttributeValues?: {},
   *  FilterExpression?: string,
   *  IndexName: string,
   *  Limit?: number,
   *  ProjectionExpression?: string,
   *  ReturnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE',
   *  Segment?: number,
   *  Select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'COUNT' | 'SPECIFIC_ATTRIBUTES',
   *  TotalSegments?: number
   * }
   * ```
   */
  public getParams(): ScanCommandInput {
    return this._params;
  }

  /**
   * Sends the internal parameters as input to the DynamoDB table to execute the scan request.
   * Call this after populating the command input params with the above methods.
   * If LastEvaluatedKey is empty, then the "last page" of results has been processed and there is no more data to be retrieved.
   * If LastEvaluatedKey is not empty, it does not necessarily mean that there is more data in the result set.
   * The only way to know when you have reached the end of the result set is when LastEvaluatedKey is empty.
   * Items and LastEvaluatedKey are returned unmarshalled.
   *
   * @returns The output from the scan command
   *
   * @example
   * ```ts
   * # Result
   * {
   *  ConsumedCapacity?: [],
   *  Count?: number,
   *  Items?: {}[],
   *  LastEvaluatedKey?: {},
   *  ScannedCount?: number
   * }
   * ```
   *
   */
  public async execute(): Promise<ScanCommandOutput> {
    // check either neither or both segment and totalSegments are defined (XOR)
    if (
      !(_.isUndefined(this._params.Segment) && _.isUndefined(this._params.TotalSegments)) &&
      (_.isUndefined(this._params.Segment) || _.isUndefined(this._params.TotalSegments))
    ) {
      throw new Error('Must declare both Segment and TotalSegment if using either.');
    }
    const result = await this._ddb.scan(this._params);
    if (result.Items) {
      result.Items = result.Items.map((item) => unmarshall(item));
    }

    if (result.LastEvaluatedKey) {
      result.LastEvaluatedKey = unmarshall(result.LastEvaluatedKey);
    }

    return result;
  }
}

export default Scanner;
