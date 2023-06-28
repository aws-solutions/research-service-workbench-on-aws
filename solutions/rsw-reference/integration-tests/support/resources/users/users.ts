/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import User from './user';

export default class Users extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'users', 'user');
    this._api = 'users';
  }

  public user(id: string): User {
    return new User(id, this._clientSession, this._api);
  }
}
