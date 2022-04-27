/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import BatchEdit from './batchEdit';
import Deleter from './deleter';
import Getter from './getter';
import Query from './query';
import Scanner from './scanner';
import Updater from './updater';

import { AttributeValue } from '@aws-sdk/client-dynamodb';
import _ from 'lodash';

export default class DynamoDBHelperService {
  private _awsRegion: string;
  private _tableName: string;

  public constructor(constants: { region: string; table: string }) {
    const { region, table } = constants;
    this._awsRegion = region;
    this._tableName = table;
  }

  public scan(params?: {
    index?: string;
    start?: { [key: string]: AttributeValue };
    filter?: string;
    strong?: boolean;
    names?: { [key: string]: string };
    values?: { [key: string]: AttributeValue };
    projection?: string | string[];
    select?: string;
    limit?: number;
    segment?: number;
    totalSegment?: number;
    capacity?: string;
  }): Scanner {
    let scanner = new Scanner({ region: this._awsRegion, table: this._tableName });
    if (params) {
      if (params.index) {
        scanner = scanner.index(params.index);
      }
      if (params.start) {
        scanner = scanner.start(params.start);
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
        scanner = scanner.values(params.values);
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

  public get(
    key: { [key: string]: AttributeValue } | { [key: string]: AttributeValue }[],
    params?: {
      strong?: boolean;
      names?: { [key: string]: string };
      projection?: string | string[];
      capacity?: string;
    }
  ): Getter {
    let getter = new Getter({ region: this._awsRegion, table: this._tableName, key: key });
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

  public query(params?: {
    index?: string;
    key?: { name: string; value: AttributeValue };
    sortKey?: string;
    eq?: AttributeValue;
    lt?: AttributeValue;
    lte?: AttributeValue;
    gt?: AttributeValue;
    gte?: AttributeValue;
    between?: { value1: AttributeValue; value2: AttributeValue };
    begins?: AttributeValue;
    start?: { [key: string]: AttributeValue };
    filter?: string;
    strong?: boolean;
    names?: { [key: string]: string };
    values?: { [key: string]: AttributeValue };
    projection?: string | string[];
    select?: string;
    limit?: number;
    forward?: boolean;
    capacity?: string;
  }): Query {
    let query = new Query({ region: this._awsRegion, table: this._tableName });
    if (params) {
      if (params.index) {
        query = query.index(params.index);
      }
      if (params.key) {
        query = query.key(params.key.name, params.key.value);
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
        query = query.start(params.start);
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
        query = query.values(params.values);
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

  public update(
    key: { [key: string]: AttributeValue },
    params?: {
      disableCreatedAt?: boolean;
      disableUpdatedAt?: boolean;
      item?: { [key: string]: AttributeValue };
      set?: string;
      add?: string;
      remove?: string | string[];
      delete?: string;
      names?: { [key: string]: string };
      values?: { [key: string]: AttributeValue };
      return?: string;
      metrics?: string;
      capacity?: string;
    }
  ): Updater {
    let updater = new Updater({ region: this._awsRegion, table: this._tableName, key: key });
    if (params) {
      if (params.disableCreatedAt) {
        updater = updater.disableCreatedAt();
      }
      if (params.disableUpdatedAt) {
        updater = updater.disableUpdatedAt();
      }
      if (params.item) {
        updater = updater.item(params.item);
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
        updater = updater.values(params.values);
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

  public delete(
    key: { [key: string]: AttributeValue },
    params?: {
      condition?: string;
      names?: { [key: string]: string };
      values?: { [key: string]: AttributeValue };
      return?: string;
      capacity?: string;
      metrics?: string;
    }
  ): Deleter {
    let deleter = new Deleter({ region: this._awsRegion, table: this._tableName, key: key });
    if (params) {
      if (params.condition) {
        deleter = deleter.condition(params.condition);
      }
      if (params.names) {
        deleter = deleter.names(params.names);
      }
      if (params.values) {
        deleter = deleter.values(params.values);
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

  public batchEdit(params?: {
    addDeleteRequest?: { [key: string]: AttributeValue };
    addWriteRequest?: { [key: string]: AttributeValue };
    addDeleteRequests?: { [key: string]: AttributeValue }[];
    addWriteRequests?: { [key: string]: AttributeValue }[];
  }): BatchEdit {
    let batchEdit = new BatchEdit({ region: this._awsRegion, table: this._tableName });
    if (params) {
      if (params.addDeleteRequest) {
        batchEdit = batchEdit.addDeleteRequest(params.addDeleteRequest);
      }
      if (params.addWriteRequest) {
        batchEdit = batchEdit.addWriteRequest(params.addWriteRequest);
      }
      if (params.addDeleteRequests) {
        batchEdit = batchEdit.addDeleteRequests(params.addDeleteRequests);
      }
      if (params.addWriteRequests) {
        batchEdit = batchEdit.addWriteRequests(params.addWriteRequests);
      }
    }
    return batchEdit;
  }
}
