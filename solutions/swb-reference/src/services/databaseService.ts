/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamoDBService, JSONValue, MetadataService } from '@aws/workbench-core-base';

export interface DatabaseServicePlugin {
  getAssociations(type: string, id: string): Promise<Associable[]>;
  storeAssociations(entity: Associable, relations: Associable[]): Promise<void>;
}

export interface Associable {
  type: string;
  id: string;
  data?: Record<string, JSONValue>;
}

export class DatabaseService implements DatabaseServicePlugin {
  private readonly _metadataService: MetadataService;
  private readonly _dynamoDbService: DynamoDBService;

  public constructor() {
    this._dynamoDbService = new DynamoDBService({
      region: process.env.AWS_REGION!,
      table: process.env.STACK_NAME!
    });
    this._metadataService = new MetadataService(this._dynamoDbService);
  }

  public async storeAssociations(entity: Associable, relations: Associable[]): Promise<void> {
    const relationTypeMap = new Map<string, Associable[]>();

    for (const relation of relations) {
      const relationType = relation.type;
      const relations = relationTypeMap.get(relationType) || [];
      relations.push(relation);
      relationTypeMap.set(relationType, relations);
    }

    for (const relationType of relationTypeMap.keys()) {
      const relations = relationTypeMap.get(relationType) || [];

      await this._metadataService.updateRelationship(
        entity.type,
        { id: entity.id, data: entity.data },
        relationType,
        relations.map((item) => {
          return { id: item.id, data: item.data };
        })
      );
    }
  }

  public getAssociations(type: string, id: string): Promise<Associable[]> {
    return Promise.resolve([]);
  }
}
