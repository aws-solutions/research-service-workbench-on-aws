/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedResponse } from '@aws/workbench-core-base';
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
    const associables: Associable[] = this._associations.get(entityKey) || [];
    return Promise.resolve(associables);
  }

  public async getAssociation(entity: Associable, relationship: Associable): Promise<Associable | undefined> {
    const associations = await this.getAssociations(entity.type, entity.id);

    for (const association of associations) {
      const isMatch = association.type === relationship.type && association.id === relationship.id;

      if (isMatch) {
        return Promise.resolve(association);
      }
    }

    return Promise.resolve(undefined);
  }

  public async listAssociations(
    entity: Associable,
    relationType: string,
    queryParams?: { pageSize?: number; paginationToken?: string }
  ): Promise<PaginatedResponse<Associable>> {
    const associations = await this.getAssociations(entity.type, entity.id);

    const response: PaginatedResponse<Associable> = {
      data: associations
    };

    return Promise.resolve(response);
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
