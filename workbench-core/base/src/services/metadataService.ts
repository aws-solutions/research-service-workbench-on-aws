/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import { ZodTypeAny } from 'zod';
import DynamoDBService from '../aws/helpers/dynamoDB/dynamoDBService';
import QueryParams from '../interfaces/queryParams';
import {
  addPaginationToken,
  DEFAULT_API_PAGE_SIZE,
  getPaginationToken,
  MAX_API_PAGE_SIZE
} from '../utilities/paginationHelper';
import { validateAndParse } from '../utilities/validatorHelper';

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
   * List dependent metadata
   * @param mainEntityPk - DDB pk of the main entity
   * @param dependencyResourceType - dependency resource type
   * @returns list of dependent metadata objects
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
  ): Promise<{ data: DependencyMetadata[]; paginationToken: string | undefined }> {
    let params: QueryParams = {
      key: { name: 'pk', value: `${mainEntityResourceType}#${mainEntityId}` },
      sortKey: 'sk',
      begins: { S: `${dependencyResourceType}#` },
      limit: Math.min(queryParams?.pageSize ?? DEFAULT_API_PAGE_SIZE, MAX_API_PAGE_SIZE)
    };

    params = addPaginationToken(queryParams?.paginationToken, params);

    const result: QueryCommandOutput = await this._ddbService.query(params).execute();
    if (!result?.Items) {
      return { data: [], paginationToken: undefined };
    }

    const data: DependencyMetadata[] = [];
    result.Items.forEach((item) => {
      data.push(validateAndParse<DependencyMetadata>(parser, item));
    });

    return { data, paginationToken: getPaginationToken(result) };
  }
}
