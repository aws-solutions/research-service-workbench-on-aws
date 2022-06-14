/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import _ from 'lodash';
import BatchEdit from './batchEdit';
import Deleter from './deleter';
import Getter from './getter';
import Query from './query';
import Scanner from './scanner';
import TransactEdit from './transactEdit';
import Updater from './updater';

interface QueryParams {
  index?: string;
  key?: { name: string; value: unknown };
  sortKey?: string;
  eq?: AttributeValue;
  lt?: AttributeValue;
  lte?: AttributeValue;
  gt?: AttributeValue;
  gte?: AttributeValue;
  between?: { value1: AttributeValue; value2: AttributeValue };
  begins?: AttributeValue;
  start?: { [key: string]: unknown };
  filter?: string;
  strong?: boolean;
  names?: { [key: string]: string };
  values?: { [key: string]: unknown };
  projection?: string | string[];
  select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT';
  limit?: number;
  forward?: boolean;
  capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
}

export { QueryParams };

export default class DynamoDBService {
  private _awsRegion: string;
  private _tableName: string;

  public constructor(constants: { region: string; table: string }) {
    const { region, table } = constants;
    this._awsRegion = region;
    this._tableName = table;
  }

  /**
   * Creates a Scanner to do scan operations on a Dynamo DB table.
   *
   * @param params - optional object of optional properties to generate a scan request
   * @returns A Scanner
   *
   * @example Only use this method to set up the Scanner in an external file
   * ```ts
   * const scanner = dynamoDBService.scan({index: 'some-index'});
   * const dataFromScanOnIndex = await scanner.execute();
   * ```
   *
   * @example Use this method to set up the Scanner and then manually edit params with scanner methods
   * ```ts
   * const scanner = dynamoDBService.scan().index({index: 'some-index'});
   * const dataFromScanOnIndex = await scanner.execute();
   * ```
   */
  public scan(params?: {
    index?: string;
    start?: { [key: string]: unknown };
    filter?: string;
    strong?: boolean;
    names?: { [key: string]: string };
    values?: { [key: string]: unknown };
    projection?: string | string[];
    select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT';
    limit?: number;
    segment?: number;
    totalSegment?: number;
    capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
  }): Scanner {
    let scanner = new Scanner({ region: this._awsRegion }, this._tableName);
    if (params) {
      if (params.index) {
        scanner = scanner.index(params.index);
      }
      if (params.start) {
        scanner = scanner.start(marshall(params.start));
      }
      if (params.filter) {
        scanner = scanner.filter(params.filter);
      }
      if (params.strong === true) {
        scanner = scanner.strong();
      }
      if (params.names) {
        scanner = scanner.names(params.names);
      }
      if (params.values) {
        scanner = scanner.values(marshall(params.values));
      }
      if (params.projection) {
        scanner = scanner.projection(params.projection);
      }
      if (params.select) {
        scanner = scanner.select(params.select);
      }
      if (params.limit) {
        scanner = scanner.limit(params.limit);
      }
      if (!_.isUndefined(params.totalSegment) && !_.isUndefined(params.segment)) {
        scanner = scanner.totalSegment(params.totalSegment).segment(params.segment);
      }
      if (params.capacity) {
        scanner = scanner.capacity(params.capacity);
      }
    }
    return scanner;
  }

  /**
   * Creates a Getter to do single get item or batch get item operations on a DynamoDB table.
   *
   * @param key - single object of key to get for single get item or list of objects of keys to get for batch get item
   * @param params - optional object of optional properties to generate a get item request
   * @returns A Getter
   *
   * @example Only use this method to set up the Getter in an external file
   * ```ts
   * const getter = dynamoDBService.get({'pk': {S: 'pk'}, 'sk': {S: 'sk'}}, {projection: 'valueIWant'});
   * const dataFromGetValueIWant = await getter.execute();
   * ```
   *
   * @example Use this method to set up the Getter and then manually edit params with getter methods
   * ```ts
   * const getter = dynamoDBService.get({'pk': {S: 'pk'}, 'sk': {S: 'sk'}});
   * const dataFromGetValueIWant = await getter.projection({projection: 'valueIWant'}).execute();
   * ```
   */
  public get(
    key: { [key: string]: unknown } | { [key: string]: unknown }[],
    params?: {
      strong?: boolean;
      names?: { [key: string]: string };
      projection?: string | string[];
      capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    }
  ): Getter {
    let getter = new Getter({ region: this._awsRegion }, this._tableName, key);
    if (params) {
      if (params.strong === true) {
        getter = getter.strong();
      }
      if (params.names) {
        getter = getter.names(params.names);
      }
      if (params.projection) {
        getter = getter.projection(params.projection);
      }
      if (params.capacity) {
        getter = getter.capacity(params.capacity);
      }
    }
    return getter;
  }

  /**
   * Creates a Query to do query operations on a DynamoDB table.
   *
   * @param params - optional object of optional properties to generate a query request
   * @returns A Query
   *
   * @example Only use this method to set up the Query in an external file
   * ```ts
   * const query = dynamoDBService.query({sortKey: 'value', eq: {N: '5'}});
   * const queryValueEq5 = await query.execute();
   * ```
   *
   * @example Use this method to set up the Query and then manually edit params with query methods
   * ```ts
   * const query = dynamoDBService.query();
   * const queryValueEq5 = await query.sortKey('value').eq({N: '5'}).execute();
   * ```
   */
  public query(params?: QueryParams): Query {
    let query = new Query({ region: this._awsRegion }, this._tableName);
    if (params) {
      if (params.index) {
        query = query.index(params.index);
      }
      if (params.key) {
        query = query.key(params.key.name, marshall(params.key.value));
      }
      if (params.sortKey) {
        query = query.sortKey(params.sortKey);
        // check only one condition was supplied
        if (
          [
            ...new Set([
              params.eq,
              params.lt,
              params.lte,
              params.gt,
              params.gte,
              params.between,
              params.begins
            ])
          ].length > 2
        ) {
          throw new Error('You cannot query on two conditions seperately for sortKey');
        }
        if (params.eq) {
          query = query.eq(params.eq);
        } else if (params.lt) {
          query = query.lt(params.lt);
        } else if (params.lte) {
          query = query.lte(params.lte);
        } else if (params.gt) {
          query = query.gt(params.gt);
        } else if (params.gte) {
          query = query.gte(params.gte);
        } else if (params.between) {
          query = query.between(params.between.value1, params.between.value2);
        } else if (params.begins) {
          query = query.begins(params.begins);
        }
      } else if (
        params.eq ||
        params.lt ||
        params.lte ||
        params.gt ||
        params.gte ||
        params.between ||
        params.begins
      ) {
        throw new Error('You cannot query on sortKey without providing a sortKey name');
      }
      if (params.start) {
        query = query.start(marshall(params.start));
      }
      if (params.filter) {
        query = query.filter(params.filter);
      }
      if (params.strong === true) {
        query = query.strong();
      }
      if (params.names) {
        query = query.names(params.names);
      }
      if (params.values) {
        query = query.values(marshall(params.values));
      }
      if (params.projection) {
        query = query.projection(params.projection);
      }
      if (params.select) {
        query = query.select(params.select);
      }
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (!_.isUndefined(params.forward)) {
        query = query.forward(params.forward);
      }
      if (params.capacity) {
        query = query.capacity(params.capacity);
      }
    }
    return query;
  }

  /**
   * Creates an Updater to do update item operations on a DynamoDB table.
   *
   * @param key - object of key to update
   * @param params - optional object of optional properties to generate an update request
   * @returns A Updater
   *
   * @example Only use this method to set up the Updater in an external file
   * ```ts
   * const updater = dynamoDBService.update({'pk': {S: 'pk'}, 'sk': {S: 'sk}}, {item: {'newAttribute': {S: 'newValue'}}});
   * const dataFromUpdate = await updater.execute();
   * ```
   *
   * @example Use this method to set up the Updater and then manually edit params with updater methods
   * ```ts
   * const updater = dynamoDBService.update({'pk': {S: 'pk'}, 'sk': {S: 'sk}});
   * const dataFromUpdate = await updater.item({'newAttribute': {S: 'newValue'}}).execute();
   * ```
   */
  public update(
    key: { [key: string]: unknown },
    params?: {
      disableCreatedAt?: boolean;
      disableUpdatedAt?: boolean;
      item?: { [key: string]: unknown };
      set?: string;
      add?: string;
      remove?: string | string[];
      delete?: string;
      names?: { [key: string]: string };
      values?: { [key: string]: unknown };
      return?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW';
      metrics?: 'NONE' | 'SIZE';
      capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    }
  ): Updater {
    let updater = new Updater({ region: this._awsRegion }, this._tableName, marshall(key));
    if (params) {
      if (params.disableCreatedAt) {
        updater = updater.disableCreatedAt();
      }
      if (params.disableUpdatedAt) {
        updater = updater.disableUpdatedAt();
      }
      if (params.item) {
        updater = updater.item(marshall(params.item, { removeUndefinedValues: true }));
      }
      if (params.set) {
        updater = updater.set(params.set);
      }
      if (params.add) {
        updater = updater.add(params.add);
      }
      if (params.remove) {
        updater = updater.remove(params.remove);
      }
      if (params.delete) {
        updater = updater.delete(params.delete);
      }
      if (params.names) {
        updater = updater.names(params.names);
      }
      if (params.values) {
        updater = updater.values(marshall(params.values));
      }
      if (params.return) {
        updater = updater.return(params.return);
      }
      if (params.metrics) {
        updater = updater.metrics(params.metrics);
      }
      if (params.capacity) {
        updater = updater.capacity(params.capacity);
      }
    }
    return updater;
  }

  /**
   * Creates a Deleter to do single delete item operations on a DynamoDB table.
   *
   * @param key - object of key to delete
   * @param params - optional object of optional properties to generate a delete request
   * @returns A Deleter
   *
   * @example Only use this method to set up the Deleter in an external file
   * ```ts
   * const deleter = dynamoDBService.delete({'pk': {S: 'pk'}, 'sk': {S: 'sk}}, {condition: 'attribute_not_exists(DONOTDELETE)'});
   * const dataFromCondDelete = await deleter.execute();
   * ```
   *
   * @example Use this method to set up the Deleter and then manually edit params with deleter methods
   * ```ts
   * const deleter = dynamoDBService.delete({'pk': {S: 'pk'}, 'sk': {S: 'sk}});
   * const dataFromCondDelete = await deleter.condition('attribute_not_exists(DONOTDELETE)').execute();
   * ```
   */
  public delete(
    key: { [key: string]: unknown },
    params?: {
      condition?: string;
      names?: { [key: string]: string };
      values?: { [key: string]: unknown };
      return?: 'NONE' | 'ALL_OLD';
      capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
      metrics?: 'NONE' | 'SIZE';
    }
  ): Deleter {
    let deleter = new Deleter({ region: this._awsRegion }, this._tableName, marshall(key));
    if (params) {
      if (params.condition) {
        deleter = deleter.condition(params.condition);
      }
      if (params.names) {
        deleter = deleter.names(params.names);
      }
      if (params.values) {
        deleter = deleter.values(marshall(params.values));
      }
      if (params.return) {
        deleter = deleter.return(params.return);
      }
      if (params.capacity) {
        deleter = deleter.capacity(params.capacity);
      }
      if (params.metrics) {
        deleter = deleter.metrics(params.metrics);
      }
    }
    return deleter;
  }

  /**
   * Creates a BatchEdit to do batch write or delete operations on a DynamoDB table.
   *
   * @param params - optional object of optional properties to generate a batch edit request
   * @returns A BatchEdit
   *
   * @example Only use this method to set up the BatchEdit in an external file
   * ```ts
   * const batchEdit = dynamoDBService.batchEdit({addDeleteRequest: {'pk': {S: 'pk'}, 'sk': {S: 'sk'}}});
   * const dataFromBatchEditSingleDelete = await batchEdit.execute();
   * ```
   *
   * @example Use this method to set up the BatchEdit and then manually edit params with batch edit methods
   * ```ts
   * const batchEdit = dynamoDBService.batchEdit();
   * const dataFromBatchEditSingleDelete = await batchEdit.addDeleteRequest({'pk': {S: 'pk'}, 'sk': {S: 'sk'}}).execute();
   * ```
   */
  public batchEdit(params?: {
    addDeleteRequest?: { [key: string]: unknown };
    addWriteRequest?: { [key: string]: unknown };
    addDeleteRequests?: { [key: string]: unknown }[];
    addWriteRequests?: { [key: string]: unknown }[];
  }): BatchEdit {
    let batchEdit = new BatchEdit({ region: this._awsRegion }, this._tableName);
    if (params) {
      if (params.addDeleteRequest) {
        batchEdit = batchEdit.addDeleteRequest(marshall(params.addDeleteRequest));
      }
      if (params.addWriteRequest) {
        batchEdit = batchEdit.addWriteRequest(marshall(params.addWriteRequest));
      }
      if (params.addDeleteRequests) {
        batchEdit = batchEdit.addDeleteRequests(params.addDeleteRequests.map((request) => marshall(request)));
      }
      if (params.addWriteRequests) {
        batchEdit = batchEdit.addWriteRequests(params.addWriteRequests.map((request) => marshall(request)));
      }
    }
    return batchEdit;
  }

  public transactEdit(params?: { addPutRequest?: { [key: string]: unknown }[] }): TransactEdit {
    let transactEdit = new TransactEdit({ region: this._awsRegion }, this._tableName);
    if (params?.addPutRequest) {
      transactEdit = transactEdit.addPutRequests(
        params.addPutRequest.map((request) => marshall(request, { removeUndefinedValues: true }))
      );
    }
    return transactEdit;
  }
}
