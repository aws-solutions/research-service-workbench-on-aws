/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BatchGetItemCommandOutput } from '@aws-sdk/client-dynamodb';
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
   * Retrieves metadata relationships related to entity and metadata related to dependencies
   * -retrieves dependencies from database by their pk, sk
   * -iterates the dependencies and creates relationship items from main entity to dependency entity using mainRelationshipMapper
   * -if dependencyRelationshipMapper exists it creates relationship items from dependency entity to main entity using dependencyRelationshipMapper
   * @param mainEntityRequest - main Entity request object
   * @param dependencyIds - pk sk pair array of dependencies
   * @param dependencyEntityMapper - function that parses ddb object to dependencies Entity Type (zod parser)
   * @param mainRelationshipMapper - function that parses main entity and dependency entity to relationship entity (main entity metadata)
   * @param dependencyRelationshipMapper - function that parses main entity and dependency entity to relationship entity (dependency metadata)
   * @returns object containing metadata relationships
   ************************************************************/
  public async getMetadataItems<EntityRequest, DependencyEntity, MainRelationship, DependencyRelationship>(
    mainEntityRequest: EntityRequest,
    dependencyIds: { pk: string; sk: string }[],
    dependencyEntityMapper: (metadata: unknown) => DependencyEntity,
    mainRelationshipMapper: (
      mainEntityRequest: EntityRequest,
      dependencyEntity: DependencyEntity
    ) => MainRelationship,
    dependencyRelationshipMapper?: (
      mainEntityRequest: EntityRequest,
      dependencyEntity: DependencyEntity
    ) => DependencyRelationship
  ): Promise<{
    mainEntityMetadata: MainRelationship[];
    dependencyMetadata: DependencyRelationship[];
  }> {
    const batchGetResult = (await this._aws.helpers.ddb
      .get(dependencyIds)
      .execute()) as BatchGetItemCommandOutput;
    const dependencies = batchGetResult.Responses![this._tableName];

    const mainEntityRelationships: MainRelationship[] = [];
    const dependencyRelationships: DependencyRelationship[] = [];

    dependencies.forEach((dependency) => {
      const dependencyEntity = dependencyEntityMapper(dependency);
      const mainRelationship = mainRelationshipMapper(mainEntityRequest, dependencyEntity);
      mainEntityRelationships.push(mainRelationship);
      if (dependencyRelationshipMapper) {
        const dependencyRelationship = dependencyRelationshipMapper(mainEntityRequest, dependencyEntity);
        dependencyRelationships.push(dependencyRelationship);
      }
    });
    return {
      mainEntityMetadata: mainEntityRelationships,
      dependencyMetadata: dependencyRelationships
    };
  }
}
