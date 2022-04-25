/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import BatchEdit from './BatchEdit';
import Deleter from './Deleter';
import Getter from './Getter';
import Query from './Query';
import Scanner from './Scanner';
import Updater from './Updater';

import { AttributeValue } from '@aws-sdk/client-dynamodb';

export default class DynamoDBHelperService {
  private _awsRegion: string;
  private _tableName: string;

  public constructor(constants: { region: string; table: string }) {
    const { region, table } = constants;
    this._awsRegion = region;
    this._tableName = table;
  }

  public scan(): Scanner {
    return new Scanner({ region: this._awsRegion, table: this._tableName });
  }

  public get(key: { [key: string]: AttributeValue } | { [key: string]: AttributeValue }[]): Getter {
    return new Getter({ region: this._awsRegion, table: this._tableName, key: key });
  }

  public query(): Query {
    return new Query({ region: this._awsRegion, table: this._tableName });
  }

  public update(key: { [key: string]: AttributeValue }): Updater {
    return new Updater({ region: this._awsRegion, table: this._tableName, key: key });
  }

  public delete(key: { [key: string]: AttributeValue }): Deleter {
    return new Deleter({ region: this._awsRegion, table: this._tableName, key: key });
  }

  public batchEdit(): BatchEdit {
    return new BatchEdit({ region: this._awsRegion, table: this._tableName });
  }
}
