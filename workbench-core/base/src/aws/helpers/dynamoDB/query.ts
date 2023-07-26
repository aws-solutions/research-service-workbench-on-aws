/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AttributeValue, QueryCommandInput, QueryCommandOutput, DynamoDB } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import _ from 'lodash';

/**
 * This class helps with building queries to a DDB table
 */
class Query {
  private _ddb: DynamoDB;
  private _params: QueryCommandInput;
  private _sortKeyName: string | undefined;

  public constructor(config: { region: string }, table: string) {
    this._ddb = new DynamoDB({ ...config });
    this._params = { TableName: table };
    this._sortKeyName = undefined;
  }

  /**
   * Sets the TableName parameter for the command input.
   * This method is not necessary if you provided the table name in the construction of Query.
   *
   * @param name - string of the table name to query on
   * @returns Query with populated params
   */
  public table(name: string): Query {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`TableName must be a string and can not be empty.`);
    }
    this._params.TableName = name;
    return this;
  }

  /**
   * Sets the IndexName parameter for the command input.
   *
   * @param name - string of the index name to query on
   * @returns Query with populated params
   */
  public index(name: string): Query {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`IndexName must be a string and can not be empty.`);
    }
    this._params.IndexName = name;
    return this;
  }

  /**
   * Helps with setting up KeyConditionExpression for command input where name = value.
   * this is for the partition key only.  If you also need to specify sort key, then use sortKey() then .eq(), .lt() or .gt().
   * However, if you use .condition() for the sort key expression, you will need to use values() and possibly names().
   *
   * @param name - string of the partition key name
   * @param value - value you are querying for on the partition key
   * @returns Query with populated params
   */
  public key(name: string, value: AttributeValue): Query {
    if (!_.isString(name) || _.isEmpty(_.trim(name))) {
      throw new Error(`Key name must be a string and can not be empty.`);
    }

    const expression = `#${name} = :${name}`;
    this._setCondition(expression);
    this.names({ [`#${name}`]: name });
    this.values({ [`:${name}`]: value });

    return this;
  }

  /**
   * Helps with setting up KeyConditionExpression for command input.
   * This is for the sort key only.  If you also need to specify partition key, then use key().
   * You must call this method before .eq(), .gt(), .gte(), .lt(), .lte().
   * However, if you use .condition() for the sort key expression, you will need to use values() and possibly names().
   *
   * @param name - string of the sort key name
   * @returns Query with populated params
   */
  public sortKey(name: string): Query {
    this._sortKeyName = name;

    return this;
  }

  /**
   * Helps with setting up KeyConditionExpression for sort key only.
   * It results in an equal expression using the sort key  "#<k> = :<k>".
   * You only want to supply the value of the sort key here since we assume you called .sortKey(name) before calling this one
   *
   * @param value - the value to check for equality against the sort key
   * @returns Query with populated params
   */
  public eq(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.eq(), however, you must call Query.sortKey() first.');
    }
    this.names({ [`#${this._sortKeyName}`]: this._sortKeyName });
    return this._internalExpression('=', value);
  }

  /**
   * Helps with setting up KeyConditionExpression for sort key only.
   * It results in a less than expression using the sort key  "#\<k\> \< :\<k\>".
   * You only want to supply the value of the sort key here since we assume you called .sortKey(name) before calling this one
   *
   * @param value - the value to check for relation against the sort key
   * @returns Query with populated params
   */
  public lt(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.lt(), however, you must call Query.sortKey() first.');
    }
    this.names({ [`#${this._sortKeyName}`]: this._sortKeyName });
    return this._internalExpression('<', value);
  }

  /**
   * Helps with setting up KeyConditionExpression for sort key only.
   * It results in a less than or equal expression using the sort key  "#\<k\> \<= :\<k\>".
   * You only want to supply the value of the sort key here since we assume you called .sortKey(name) before calling this one
   *
   * @param value - the value to check for relation against the sort key
   * @returns Query with populated params
   */
  public lte(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.lte(), however, you must call Query.sortKey() first.');
    }
    this.names({ [`#${this._sortKeyName}`]: this._sortKeyName });
    return this._internalExpression('<=', value);
  }

  /**
   * Helps with setting up KeyConditionExpression for sort key only.
   * It results in a greater than expression using the sort key  "#\<k\> \> :\<k\>".
   * You only want to supply the value of the sort key here since we assume you called .sortKey(name) before calling this one
   *
   * @param value - the value to check for relation against the sort key
   * @returns Query with populated params
   */
  public gt(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.gt(), however, you must call Query.sortKey() first.');
    }
    this.names({ [`#${this._sortKeyName}`]: this._sortKeyName });
    return this._internalExpression('>', value);
  }

  /**
   * Helps with setting up KeyConditionExpression for sort key only.
   * It results in a greater than or equal to expression using the sort key  "#\<k\> \>= :\<k\>".
   * You only want to supply the value of the sort key here since we assume you called .sortKey(name) before calling this one
   *
   * @param value - the value to check for relation against the sort key
   * @returns Query with populated params
   */
  public gte(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.gte(), however, you must call Query.sortKey() first.');
    }
    this.names({ [`#${this._sortKeyName}`]: this._sortKeyName });
    return this._internalExpression('>=', value);
  }

  /**
   * Helps with setting up KeyConditionExpression for sort key only.
   * It results in the between expression using the sort key  "#<k> BETWEEN :<v1> AND :<v2>".
   * You only want to supply the two between values of the sort key here since we assume you called .sortKey(name) before calling this one
   *
   * @param value1 - the first value to check for against the sort key
   * @param value2 - the second value to check for against the sort key
   * @returns Query with populated params
   */
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
    this.names({ [`#${this._sortKeyName}`]: this._sortKeyName });
    return this;
  }

  /**
   * Helps with setting up KeyConditionExpression for sort key only.
   * It results in a begins_with expression using the sort key  "begins_with( #<k> ,:<k> )".
   * You only want to supply the two between values of the sort key here since we assume you called .sortKey(name) before calling this one
   *
   * @param value - the value to check for relation against the sort key
   * @returns Query with populated params
   */
  public begins(value: AttributeValue): Query {
    if (!this._sortKeyName) {
      throw new Error('You tried to call Query.begins(), however, you must call Query.sortKey() first.');
    }
    const expression = `begins_with ( #${this._sortKeyName}, :${this._sortKeyName} )`;
    this._setCondition(expression);
    this.values({ [`:${this._sortKeyName}`]: value });
    this.names({ [`#${this._sortKeyName}`]: this._sortKeyName });
    return this;
  }

  /**
   * Helper method to set the internal expression. Used by public methods on querying on sort key.
   *
   * @param expr - string that defines the relation to query on (ex: =, \>, \<, etc.)
   * @param value - the AttributeValue to check against
   * @returns Query with populated params
   */
  private _internalExpression(expr: string, value: AttributeValue): Query {
    const expression = `#${this._sortKeyName} ${expr} :${this._sortKeyName}`;
    this._setCondition(expression);
    this.values({ [`:${this._sortKeyName}`]: value });
    return this;
  }

  /**
   * Helper method to set the condition. Used by public methods on querying on sort key.
   *
   * @param expression - string that defines the condition to query on (ex: begins_with())
   * @returns Query with populated params
   */
  private _setCondition(expression: string): void {
    if (this._params.KeyConditionExpression) {
      this._params.KeyConditionExpression = `${this._params.KeyConditionExpression} AND ${expression}`;
    } else {
      this._params.KeyConditionExpression = expression;
    }
  }

  /**
   * Sets the ExclusiveStartKey parameter for the command input.
   * Use for pagination by providing the LastEvaluatedKey in the previous request as the ExclusiveStartKey in the new request.
   *
   * @param key - primary key of the element to start with (exclusive) in a query
   * @returns Query with populated params
   */
  public start(key: { [key: string]: AttributeValue } | undefined): Query {
    if (!key) {
      delete this._params.ExclusiveStartKey;
    } else {
      this._params.ExclusiveStartKey = key;
    }
    return this;
  }

  /**
   * Sets the FilterExpression parameter of the command input.
   * Items that do not satisfy the FilterExpression criteria are not returned.
   * A FilterExpression does not allow key attributes. You cannot define a filter expression based on a partition key or a sort key.
   * A FilterExpression is applied after the items have already been read; the process of filtering does not consume any additional read capacity units.
   * Filter expressions can use the same comparators, functions, and logical operators as a key condition expression, with the addition of the not-equals operator (\<\>), the OR operator, the CONTAINS operator, the IN operator, and the BEGINS_WITH operator.
   *
   * @param str - a string that contains conditions that DynamoDB applies after the Query operation, but before the data is returned to you
   * @returns Query with populated params
   *
   * @example Filtering on items that do not have the latest attribute
   * ```ts
   * # Usage
   * Query.filter(attribute_not_exists(latest))
   * ```
   */
  public filter(str: string): Query {
    if (this._params.FilterExpression) {
      this._params.FilterExpression = `${this._params.FilterExpression} ${str}`;
    } else {
      this._params.FilterExpression = str;
    }
    return this;
  }

  /**
   * Sets ConsistentRead to be true for command input.
   * If set to true, then the operation uses strongly consistent reads; otherwise, the operation uses eventually consistent reads.
   *
   * @returns Query with populated params
   */
  public strong(): Query {
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
   * @returns Query with populated params
   *
   * @example Using the reserved word 'Percentile' in your request
   * ```ts
   * # Usage
   * Query.names({"#P":"Percentile"}).condition("#P = 50");
   * ```
   */
  public names(obj: { [key: string]: string } = {}): Query {
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
   * @returns Query with populated params
   *
   * @example Filtered query on status
   * ```ts
   * # Usage
   * Query.values({ ":avail":{"S":"Available"}, ":back":{"S":"Backordered"}, ":disc":{"S":"Discontinued"} }).filter('ProductStatus IN (:avail, :back, :disc)');
   * ```
   */
  public values(obj: { [key: string]: AttributeValue } = {}): Query {
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
   * @returns Query with populated params
   */
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
    } else {
      throw new Error(`"${expr}" must be a string or an array to generate the projection expression.`);
    }

    return this;
  }

  /**
   * Sets the Select parameter of the command input. The valid values are:
   *  ALL_ATTRIBUTES - Returns all item attributes from the specified table or index. If you query a local secondary index, then for each matching item in the index, DynamoDB fetches the entire item from the parent table. If the index is configured to project all item attributes, then all the data can be obtained from the local secondary index, and no fetching is required.
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
   * @param str - ALL_ATTRIBUTES, ALL_PROJECTED_ATTRIBUTES, SPECIFIC_ATTRIBUTES, or COUNT (not case-sensitive)
   * @returns Query with populated params
   */
  public select(str: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT'): Query {
    if (this._params.ProjectionExpression && str !== 'SPECIFIC_ATTRIBUTES') {
      throw new Error(`You cannot select values except SPECIFIC_ATTRIBUTES when using projectionExpression`);
    }
    this._params.Select = str;
    return this;
  }

  /**
   * Sets the Limit parameter of the command input.
   * If DynamoDB processes the number of items up to the limit while processing the results, it stops the operation and returns the matching values up to that point, and a key in LastEvaluatedKey to apply in a subsequent operation, so that you can pick up where you left off.
   * Also, if the processed dataset size exceeds 1 MB before DynamoDB reaches this limit, it stops the operation and returns the matching values up to the limit, and a key in LastEvaluatedKey to apply in a subsequent operation to continue the operation.
   *
   * @param num - the maximum number of items to evaluate (not necessarily the number of matching items)
   * @returns Query with populated params
   */
  public limit(num: number): Query {
    this._params.Limit = num;
    return this;
  }

  /**
   * Sets the ScanIndexForward parameter of the command input.
   * If true (default), the traversal is performed in ascending order; if false, the traversal is performed in descending order
   *
   * @param yesOrNo - true or false
   * @returns Query with populated params
   */
  public forward(yesOrNo: boolean = true): Query {
    this._params.ScanIndexForward = yesOrNo;
    return this;
  }

  /**
   * Sets the ReturnConsumedCapacity of the command input.
   * Determines the level of detail about either provisioned or on-demand throughput consumption that is in the response:
   *  INDEXES - The response includes the aggregate ConsumedCapacity for the operation, together with ConsumedCapacity for each table and secondary index that was accessed.
   *  TOTAL - The response includes only the aggregate ConsumedCapacity for the operation.
   *  NONE - No ConsumedCapacity details are included in the response.
   *
   * @param str - indexes, total, or none (non-case-sensitive strings)
   * @returns Query with populated params
   */
  public capacity(str: 'INDEXES' | 'TOTAL' | 'NONE'): Query {
    this._params.ReturnConsumedCapacity = str;
    return this;
  }

  /**
   * Gets the internal _params value of the command input. Used for testing purposes.
   *
   * @returns The parameters for the QueryCommandInput
   *
   * @example Returning command input
   * ```ts
   * # Result
   * {
   *  Key: {},
   *  TableName: string,
   *  ConsistentRead?: boolean,
   *  ExclusiveStartKey?: {},
   *  ExpressionAttributeNames?: {},
   *  ExpressionAttributeValues?: {},
   *  FilterExpression?: string,
   *  IndexName: string,
   *  KeyConditionExpression?: string,
   *  Limit?: number,
   *  ProjectionExpression?: string,
   *  ReturnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE',
   *  ScanIndexForward?: boolean,
   *  Select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'COUNT' | 'SPECIFIC_ATTRIBUTES'
   * }
   * ```
   */
  public getParams(): QueryCommandInput {
    return this._params;
  }

  /**
   * Sends the internal parameters as input to the DynamoDB table to execute the query request.
   * Call this after populating the command input params with the above methods.
   * If LastEvaluatedKey is empty, then the "last page" of results has been processed and there is no more data to be retrieved.
   * If LastEvaluatedKey is not empty, it does not necessarily mean that there is more data in the result set.
   * The only way to know when you have reached the end of the result set is when LastEvaluatedKey is empty.
   * Items and LastEvaluatedKey are returned unmarshalled.
   *
   * @returns The output from the query command
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
   */
  public async execute(): Promise<QueryCommandOutput> {
    const result = await this._ddb.query(this._params);
    if (result.Items) {
      result.Items = result.Items.map((item) => unmarshall(item));
    }

    if (result.LastEvaluatedKey) {
      result.LastEvaluatedKey = unmarshall(result.LastEvaluatedKey);
    }

    return result;
  }
}

export default Query;
