/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBService,
  JSONValue,
  MetadataService,
  PaginatedResponse,
  RelationshipDDBItemParser
} from '@aws/workbench-core-base';

export interface DatabaseServicePlugin {
  getAssociation(entity: Associable, relationship: Associable): Promise<Associable | undefined>;

  listAssociations(
    entity: Associable,
    relationType: string,
    queryParams?: {
      pageSize?: number;
      paginationToken?: string;
    }
  ): Promise<PaginatedResponse<Associable>>;
  storeAssociations(entity: Associable, relations: Associable[]): Promise<void>;
  removeAssociations(entity: Associable, relations: Associable[]): Promise<void>;
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

  public async listAssociations(
    entity: Associable,
    relationType: string,
    queryParams?: {
      pageSize?: number;
      paginationToken?: string;
    }
  ): Promise<PaginatedResponse<Associable>> {
    const response = await this._metadataService.listDependentMetadata(
      entity.type,
      entity.id,
      relationType,
      RelationshipDDBItemParser,
      queryParams
    );

    const associables: Associable[] = response.data.map((item) => {
      return {
        type: relationType,
        id: item.id,
        data: {
          pk: item.pk,
          sk: item.sk
        }
      };
    });

    return {
      data: associables,
      paginationToken: response.paginationToken
    };
  }

  public async removeAssociations(entity: Associable, relations: Associable[]): Promise<void> {
    const relationTypeMap = new Map<string, Associable[]>();

    for (const relation of relations) {
      const relationType = relation.type;
      const relations = relationTypeMap.get(relationType) || [];
      relations.push(relation);
      relationTypeMap.set(relationType, relations);
    }

    for (const relationType of relationTypeMap.keys()) {
      const relations = relationTypeMap.get(relationType) || [];

      await this._metadataService.deleteRelationships(
        entity.type,
        entity.id,
        relationType,
        relations.map((item) => item.id)
      );
    }
  }

  public async getAssociation(entity: Associable, relationship: Associable): Promise<Associable | undefined> {
    const association = await this._metadataService.getMetadataItem(
      entity.type,
      entity.id,
      relationship.type,
      relationship.id,
      RelationshipDDBItemParser
    );

    if (association === undefined) {
      return undefined;
    }

    return {
      type: relationship.type,
      id: relationship.id,
      data: {
        pk: association.pk as string,
        sk: association.sk as string
      }
    };
  }
}
