/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import {
  BatchGetItemCommandOutput,
  DeleteItemCommandOutput,
  GetItemCommandOutput
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import _ from 'lodash';
import DeleteItemParams from '../../../interfaces/deleteItemParams';
import GetItemParams from '../../../interfaces/getItemParams';
import PaginatedJsonResponse from '../../../interfaces/paginatedJsonResponse';
import QueryParams from '../../../interfaces/queryParams';
import JSONValue from '../../../types/json';
import { getPaginationToken } from '../../../utilities/paginationHelper';
import BatchEdit from './batchEdit';
import { MAX_GET_ITEMS_SIZE } from './ddbUtil';
import Deleter from './deleter';
import Getter from './getter';
import { UpdateParams } from './interfaces/updateParams';
import { UpdateUnmarshalledOutput } from './interfaces/updateUnmarshalledOutput';
import Query from './query';
import Scanner from './scanner';
import TransactEdit from './transactEdit';
import Updater from './updater';

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
   * Gets a single item from the DynamoDB table.
   *
   * @param params - {@link GetItemParams} object of properties to generate a get item request
   * @returns Promise of a string, {@link JSONValue} paired object
   *
   * @example Use this to get a single item from the DynamoDb table.
   * ```ts
   * const result = dynamoDBService.getItem({key: 'pk'});
   * ```
   */
  public async getItem(params: GetItemParams): Promise<Record<string, JSONValue>> {
    const result = (await this.get(params.key, params.params).execute()) as GetItemCommandOutput;

    return result.Item as unknown as Record<string, JSONValue>;
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
   * retrieves items from DynamoDB table.
   *
   * @param keys - array of keys to retrieve
   * @param params - optional object of optional properties to generate a get item request
   * @returns Promise\<Record\<string,JSONValue\>\>
   *
   * @example Use this method to retrieve an item from ddb by Id
   * ```ts
   * const item = await dynamoDBService.getItems([{'pk': 'pk', 'sk': 'sk'}, {'pk': 'pk2', 'sk': 'sk2'}], {projection: 'valueIWant'});
   * ```
   */
  public async getItems(
    keys: Record<string, unknown>[],
    params?: {
      strong?: boolean;
      names?: { [key: string]: string };
      projection?: string | string[];
      capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    }
  ): Promise<Record<string, JSONValue>[]> {
    if (keys.length > MAX_GET_ITEMS_SIZE)
      throw new Error(`Cannot retrieve more than ${MAX_GET_ITEMS_SIZE} items by request.`);
    const batchGetResult = (await this.get(keys, params).execute()) as BatchGetItemCommandOutput;
    return batchGetResult.Responses![this._tableName].map((item) => {
      return item as unknown as Record<string, JSONValue>;
    });
  }

  /**
   * Queries the DynamoDB table.
   *
   * @param params - optional object of optional properties to generate a query request
   * @returns Promise<PaginatedJsonResponse>
   *
   * @example Use this to get paginated items from the DynamoDb table.
   * ```ts
   * const result = dynamoDBService.getPaginatedItems({sortKey: 'value', eq: {N: '5'}});
   * ```
   */
  public async getPaginatedItems(params?: QueryParams): Promise<PaginatedJsonResponse> {
    const result = await this.query(params).execute();

    const retrievedItems = result.Items || [];

    const data = retrievedItems.map((item) => item as unknown as Record<string, JSONValue>);
    return {
      data,
      paginationToken: getPaginationToken(result)
    };
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
        query = query.key(params.key.name, marshall(params.key.value, { removeUndefinedValues: true }));
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
        query = query.values(marshall(params.values, { removeUndefinedValues: true }));
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
   * Places a DDB Update call and formats the response.
   *
   * @param updateParams - {@link UpdateParams} object to pass to the update request
   * @returns a {@link UpdateUnmarshalledOutput} item where Attributes is unmarshalled
   */
  public async updateExecuteAndFormat(updateParams: UpdateParams): Promise<UpdateUnmarshalledOutput> {
    const result = await this.update(updateParams).execute();

    const unmarshalledResult = {
      Attributes: result.Attributes ? unmarshall(result.Attributes) : undefined,
      ConsumedCapacity: result.ConsumedCapacity || undefined,
      ItemCollectionMetrics: result.ItemCollectionMetrics || undefined
    };

    return unmarshalledResult;
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
  public update(updateParams: UpdateParams): Updater {
    let updater = new Updater({ region: this._awsRegion }, this._tableName, marshall(updateParams.key));
    if (updateParams.params) {
      if (updateParams.params.disableCreatedAt) {
        updater = updater.disableCreatedAt();
      }
      if (updateParams.params.disableUpdatedAt) {
        updater = updater.disableUpdatedAt();
      }
      if (updateParams.params.item) {
        updater = updater.item(marshall(updateParams.params.item, { removeUndefinedValues: true }));
      }
      if (updateParams.params.set) {
        updater = updater.set(updateParams.params.set);
      }
      if (updateParams.params.add) {
        updater = updater.add(updateParams.params.add);
      }
      if (updateParams.params.remove) {
        updater = updater.remove(updateParams.params.remove);
      }
      if (updateParams.params.delete) {
        updater = updater.delete(updateParams.params.delete);
      }
      if (updateParams.params.names) {
        updater = updater.names(updateParams.params.names);
      }
      if (updateParams.params.values) {
        updater = updater.values(marshall(updateParams.params.values));
      }
      if (updateParams.params.return) {
        updater = updater.return(updateParams.params.return);
      }
      if (updateParams.params.metrics) {
        updater = updater.metrics(updateParams.params.metrics);
      }
      if (updateParams.params.capacity) {
        updater = updater.capacity(updateParams.params.capacity);
      }
    }
    return updater;
  }

  /**
   * Deletes a single item from the DynamoDB table.
   *
   * @param params - {@link DeleteItemParams} object of properties to generate a delete item request
   * @returns Promise of a string, {@link JSONValue} paired object
   *
   * @example Use this to delete a single item from the DynamoDb table.
   * ```ts
   * const result = dynamoDBService.deleteItem({key: 'pk'});
   * ```
   */
  public async deleteItem(params: DeleteItemParams): Promise<Record<string, JSONValue>> {
    const result = (await this.delete(params.key, params.params).execute()) as DeleteItemCommandOutput;

    return result.Attributes as unknown as Record<string, JSONValue>;
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

  /**
   * Commits transactions to the table
   *
   * @param params - the items for the transaction
   */
  public async commitTransaction(params?: {
    addPutRequests?: {
      item: Record<string, JSONValue | Set<JSONValue>>;
      conditionExpression?: string;
      expressionAttributeNames?: Record<string, string>;
      expressionAttributeValues?: Record<string, JSONValue | Set<JSONValue>>;
    }[];
    addPutItems?: Record<string, JSONValue | Set<JSONValue>>[];
    addDeleteRequests?: Record<string, JSONValue | Set<JSONValue>>[];
  }): Promise<void> {
    await this.transactEdit(params).execute();
  }

  /**
   * @deprecated Use `commitTransaction` instead
   * @param params - the items for the transaction
   * @returns A TransactEdit object
   */
  public transactEdit(params?: {
    addPutRequests?: {
      item: Record<string, JSONValue | Set<JSONValue>>;
      conditionExpression?: string;
      expressionAttributeNames?: Record<string, string>;
      expressionAttributeValues?: Record<string, JSONValue | Set<JSONValue>>;
    }[];
    addPutItems?: Record<string, JSONValue | Set<JSONValue>>[];
    addDeleteRequests?: Record<string, JSONValue | Set<JSONValue>>[];
  }): TransactEdit {
    let transactEdit = new TransactEdit({ region: this._awsRegion }, this._tableName);
    if (params?.addDeleteRequests) {
      transactEdit = transactEdit.addDeleteRequests(
        params.addDeleteRequests.map((request) => marshall(request))
      );
    }
    if (params?.addPutItems) {
      transactEdit = transactEdit.addPutItems(
        params.addPutItems.map((request) => marshall(request, { removeUndefinedValues: true }))
      );
    }
    if (params?.addPutRequests) {
      transactEdit = transactEdit.addPutRequests(
        params.addPutRequests.map((request) => {
          return {
            item: marshall(request.item, { removeUndefinedValues: true }),
            conditionExpression: request.conditionExpression,
            expressionAttributeNames: request.expressionAttributeNames,
            expressionAttributeValues: request.expressionAttributeValues
              ? marshall(request.expressionAttributeValues, { removeUndefinedValues: true })
              : undefined
          };
        })
      );
    }
    return transactEdit;
  }

  /**
   * @returns the table name
   */
  public getTableName(): string {
    return this._tableName;
  }
}
