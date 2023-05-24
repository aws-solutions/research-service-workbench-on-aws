/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ZodTypeAny } from 'zod';
import DynamoDBService from '../aws/helpers/dynamoDB/dynamoDBService';
import PaginatedResponse from '../interfaces/paginatedResponse';
import QueryParams from '../interfaces/queryParams';
import JSONValue from '../types/json';
import { addPaginationToken, DEFAULT_API_PAGE_SIZE, MAX_API_PAGE_SIZE } from '../utilities/paginationHelper';
import { validateAndParse } from '../utilities/validatorHelper';

const MAX_TRANSACTION_SIZE: number = 50;

export class MetadataService {
  private readonly _ddbService: DynamoDBService;

  public constructor(ddbService: DynamoDBService) {
    this._ddbService = ddbService;
  }

  /************************************************************
   * Retrieves metadata relationships related to entity and metadata related to dependencies
   * @param mainEntityRequest - main Entity request object
   * @param dependencies - array of dependencies
   * @param mainMetadataMapper - function that parses main entity request and dependency entity to main entity metadata
   * @param dependencyMetadataMapper - function that parses main entity request and dependency entity to dependency metadata
   * @returns object containing main entity metadata and dependency metadata
   ************************************************************/
  public getMetadataItems<EntityRequest, DependencyEntity, MainEntityMetadata, DependencyMetadata>(
    mainEntityRequest: EntityRequest,
    dependencies: DependencyEntity[],
    mainMetadataMapper: (
      mainEntityRequest: EntityRequest,
      dependencyEntity: DependencyEntity
    ) => MainEntityMetadata,
    dependencyMetadataMapper?: (
      mainEntityRequest: EntityRequest,
      dependencyEntity: DependencyEntity
    ) => DependencyMetadata
  ): {
    mainEntityMetadata: MainEntityMetadata[];
    dependencyMetadata: DependencyMetadata[];
  } {
    const mainEntityMetadata: MainEntityMetadata[] = [];
    const dependencyMetadata: DependencyMetadata[] = [];

    dependencies.forEach((dependency) => {
      const mainMetadataItem = mainMetadataMapper(mainEntityRequest, dependency);
      mainEntityMetadata.push(mainMetadataItem);
      if (dependencyMetadataMapper) {
        const dependencyMetadataItem = dependencyMetadataMapper(mainEntityRequest, dependency);
        dependencyMetadata.push(dependencyMetadataItem);
      }
    });
    return {
      mainEntityMetadata,
      dependencyMetadata
    };
  }

  /**
   *
   * @param mainEntityResourceType - main entity resource type
   * @param mainEntityId - main entity id
   * @param dependencyResourceType - dependency resource type
   * @param parser - Zod parser for metadata object
   * @param queryParams - parameters to query metadata. Supported page size and pagination token.
   * @returns object containing list of metadata objects and continuation token.
   */
  public async listDependentMetadata<DependencyMetadata extends { pk: string; sk: string; id: string }>(
    mainEntityResourceType: string,
    mainEntityId: string,
    dependencyResourceType: string,
    parser: ZodTypeAny,
    queryParams?: {
      pageSize?: number;
      paginationToken?: string;
    }
  ): Promise<PaginatedResponse<DependencyMetadata>> {
    let params: QueryParams = {
      key: { name: 'pk', value: `${mainEntityResourceType}#${mainEntityId}` },
      sortKey: 'sk',
      begins: { S: `${dependencyResourceType}#` },
      limit: Math.min(queryParams?.pageSize ?? DEFAULT_API_PAGE_SIZE, MAX_API_PAGE_SIZE)
    };

    params = addPaginationToken(queryParams?.paginationToken, params);

    const { data, paginationToken } = await this._ddbService.getPaginatedItems(params);
    const dependencyMetadata: DependencyMetadata[] = [];
    data.forEach((item) => {
      dependencyMetadata.push(validateAndParse<DependencyMetadata>(parser, item));
    });

    return { data: dependencyMetadata, paginationToken };
  }

  public async updateRelationship(
    mainEntityResourceType: string,
    mainEntity: { id: string; data?: Record<string, JSONValue> },
    dependencyResourceType: string,
    dependencies: { id: string; data?: Record<string, JSONValue> }[]
  ): Promise<void> {
    if (!dependencies.length) {
      return;
    }

    if (dependencies.length > MAX_TRANSACTION_SIZE) {
      throw new Error(`Cannot add more than ${MAX_TRANSACTION_SIZE} dependencies in single transaction.`);
    }

    const pk = `${mainEntityResourceType}#${mainEntity.id}`;
    const items: Array<{ pk: string; sk: string } & Record<string, JSONValue>> = [];
    dependencies.forEach((dependency) => {
      const currentDate = new Date().toISOString();
      const mainWithDependency = {
        pk,
        sk: `${dependencyResourceType}#${dependency.id}`,
        id: dependency.id,
        createdAt: currentDate,
        updatedAt: currentDate,
        ...(dependency.data ?? {})
      };

      const dependencyWithMain = {
        pk: `${dependencyResourceType}#${dependency.id}`,
        sk: pk,
        id: mainEntity.id,
        createdAt: currentDate,
        updatedAt: currentDate,
        ...(mainEntity.data ?? {})
      };

      items.push(mainWithDependency);
      items.push(dependencyWithMain);
    });

    await this._ddbService
      .transactEdit({
        addPutItems: items
      })
      .execute();
  }

  public async deleteRelationships(
    mainEntityResourceType: string,
    mainEntityId: string,
    dependencyResourceType: string,
    dependentIds: string[]
  ): Promise<void> {
    if (!dependentIds.length) {
      return;
    }

    if (dependentIds.length > MAX_TRANSACTION_SIZE) {
      throw new Error(`Cannot delete more than ${MAX_TRANSACTION_SIZE} dependencies in single transaction.`);
    }

    const pk = `${mainEntityResourceType}#${mainEntityId}`;
    const items: Array<{ pk: string; sk: string }> = [];
    dependentIds.forEach((dependencyId: string) => {
      const mainWithDependency = {
        pk,
        sk: `${dependencyResourceType}#${dependencyId}`
      };

      const dependencyWithMain = {
        pk: `${dependencyResourceType}#${dependencyId}`,
        sk: pk
      };

      items.push(mainWithDependency);
      items.push(dependencyWithMain);
    });

    await this._ddbService
      .transactEdit({
        addDeleteRequests: items
      })
      .execute();
  }

  /**
   * Retrieves a single instance of dependency metadata by Ids
   * @param mainEntityResourceType - main entity resource type
   * @param mainEntityId - main entity id
   * @param dependencyResourceType - dependency resource type
   * @param dependencyId - dependency entity id
   * @param parser - Zod parser for metadata object
   * @returns object with metadata information
   */
  public async getMetadataItem<DependencyMetadata extends { pk: string; sk: string; id: string }>(
    mainEntityResourceType: string,
    mainEntityId: string,
    dependencyResourceType: string,
    dependencyId: string,
    parser: ZodTypeAny
  ): Promise<DependencyMetadata | undefined> {
    const item = await this._ddbService.getItem({
      key: {
        pk: `${mainEntityResourceType}#${mainEntityId}`,
        sk: `${dependencyResourceType}#${dependencyId}`
      }
    });

    if (item === undefined) {
      return undefined;
    }
    const resource: DependencyMetadata = parser.parse(item);
    return Promise.resolve(resource);
  }
}
