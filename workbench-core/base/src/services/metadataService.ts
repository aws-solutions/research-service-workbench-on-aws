/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BatchGetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import AwsService from '../aws/awsService';

export class MetadataService {
  private _aws: AwsService;
  private _tableName: string;
  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }
  /************************************************************
   * Saves entity ,metadata related to entity and metadata related to dependencies
   * -retrieves dependencies from database by their pk, sk
   * -iterates the dependencies and creates relationship items from main entity to dependency entity using mainRelationshipMapper
   * -if dependencyRelationshipMapper exists it creates relationship items from dependency entity to main entity using dependencyRelationshipMapper
   * @param mainEntity - main Entity to save
   * @param dependencyIds - pk sk pair array of dependencies
   * @param dependencyEntityMapper - function that parses ddb object to dependencies Entity Type (zod parser)
   * @param mainRelationshipMapper - function that parses main entity and dependency entity to relationship entity (main entity metadata)
   * @param dependencyRelationshipMapper - function that parses main entity and dependency entity to relationship entity (dependency metadata)
   * @returns object containing saved relationships and main entity
   ************************************************************/
  public async saveMetadataItems<MainEntity, DependencyEntity, MainRelationship, DependencyRelationship>(
    mainEntity: MainEntity,
    dependencyIds: { pk: string; sk: string }[],
    dependencyEntityMapper: (metadata: unknown) => DependencyEntity,
    mainRelationshipMapper: (
      mainEntityMetadata: MainEntity,
      dependencyMetadata: DependencyEntity
    ) => MainRelationship,
    dependencyRelationshipMapper?: (
      mainEntityMetadata: MainEntity,
      dependencyMetadata: DependencyEntity
    ) => DependencyRelationship,
    saveMainEntity: boolean = false
  ): Promise<{
    entity: MainEntity;
    mainEntityMetadata: MainRelationship[];
    dependencyMetadata: DependencyRelationship[];
  }> {
    const batchGetResult = (await this._aws.helpers.ddb
      .get(dependencyIds)
      .execute()) as BatchGetItemCommandOutput;
    const dependenciesMetadata = batchGetResult.Responses![this._tableName];

    const itemsToSave: Record<string, unknown>[] = [];
    const mainEntityRelationships: MainRelationship[] = [];
    const dependencyRelationships: DependencyRelationship[] = [];

    if (saveMainEntity) {
      itemsToSave.push(mainEntity as Record<string, unknown>);
    }

    dependenciesMetadata.forEach((dependency) => {
      const dependencyEntity = dependencyEntityMapper(dependency);
      const mainRelationship = mainRelationshipMapper(mainEntity, dependencyEntity);
      mainEntityRelationships.push(mainRelationship);
      itemsToSave.push(mainRelationship as Record<string, unknown>);
      if (dependencyRelationshipMapper) {
        const dependencyRelationship = dependencyRelationshipMapper(mainEntity, dependencyEntity);
        dependencyRelationships.push(dependencyRelationship);
        itemsToSave.push(dependencyRelationship as Record<string, unknown>);
      }
    });
    try {
      await this._aws.helpers.ddb
        .transactEdit({
          addPutRequest: itemsToSave
        })
        .execute();
    } catch (e) {
      console.log(
        `Failed to create metadata. DDB Transact Items attribute: ${JSON.stringify(itemsToSave)}`,
        e
      );
      console.error('Failed to create metadata', e);
      throw Boom.internal('Failed to create metadata');
    }
    return {
      entity: mainEntity,
      mainEntityMetadata: mainEntityRelationships,
      dependencyMetadata: dependencyRelationships
    };
  }
}
