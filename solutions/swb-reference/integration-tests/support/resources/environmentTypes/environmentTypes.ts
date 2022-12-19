/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import EnvironmentType from './environmentType';

export default class EnvironmentTypes extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'environmentTypes', 'environmentType');
    this._api = 'environmentTypes';
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public environmentType(id: string): EnvironmentType {
    return new EnvironmentType(id, this._clientSession, this._api);
  }
}
