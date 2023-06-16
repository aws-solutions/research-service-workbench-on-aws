/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Associable, DatabaseServicePlugin } from '../services/databaseService';

export class MockDatabaseService implements DatabaseServicePlugin {
  private _associations: Map<string, Associable[]> = new Map<string, Associable[]>();

  public storeAssociations(entity: Associable, relations: Associable[]): Promise<void> {
    this._updateAssociations(entity, relations);

    for (const relation of relations) {
      this._updateAssociations(relation, [entity]);
    }

    return Promise.resolve();
  }

  public removeAssociations(entity: Associable, relations: Associable[]): Promise<void> {
    this._deleteAssociations(entity, relations);

    for (const relation of relations) {
      this._deleteAssociations(relation, [entity]);
    }

    return Promise.resolve();
  }

  public getAssociations(type: string, id: string): Promise<Associable[]> {
    const entityKey = `${type}#${id}`;
    return Promise.resolve(this._associations.get(entityKey) as Associable[]);
  }

  private _keyForAssociable(associable: Associable): string {
    return `${associable.type}#${associable.id}`;
  }

  private _updateAssociations(entity: Associable, relations: Associable[]): void {
    const key = this._keyForAssociable(entity);
    const associations = this._associations.get(key) || [];

    this._associations.set(key, associations.concat(relations));
  }

  private _deleteAssociations(entity: Associable, relations: Associable[]): void {
    const key = this._keyForAssociable(entity);
    let associations = this._associations.get(key) || [];

    associations = associations.filter((item) => {
      return item.type === entity.type && item.id === entity.id;
    });

    this._associations.set(key, associations);
  }
}
