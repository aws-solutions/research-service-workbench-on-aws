/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BatchGetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import AwsService from '../aws/awsService';
import { metadataParser } from '../interfaces/metadata';

export class MetadataService {
  private _aws: AwsService;
  private _tableName: string;
  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }
  /************************************************************
   * Given a main entity ,its dependencies and their mappers, this method
   * -retrieves entities from database by their pk, sk
   * -iterates the dependencies and creates relationship items from main entity to dependency entity using mainRelationshipMapper
   * -if dependencyRelationshipMapper exists it creates relationship items from dependency entity to main entity using dependencyRelationshipMapper
   * @param mainEntityId - pk sk pair of main Entity
   * @param dependencyIds - pk sk pair array of dependencies
   * @param mainEntityMapper - function that parses ddb object to main Entity Type (zod parser)
   * @param dependencyEntityMapper - function that parses ddb object to dependencies Entity Type (zod parser)
   * @param mainRelationshipMapper - function that parses main entity and dependency entity to relationship entity (main to dependency)
   * @param dependencyRelationshipMapper - function that parses main entity and dependency entity to relationship entity (dependency to main)
   ************************************************************/
  public async GenerateMetadataItems<MainEntity, DependencyEntity, MainRelationship, DependencyRelationship>(
    mainEntityId: { pk: string; sk: string },
    dependencyIds: { pk: string; sk: string }[],
    mainEntityMapper: (metadata: unknown) => MainEntity,
    dependencyEntityMapper: (metadata: unknown) => DependencyEntity,
    mainRelationshipMapper: (
      mainEntityMetadata: MainEntity,
      dependencyMetadata: DependencyEntity
    ) => MainRelationship,
    dependencyRelationshipMapper?: (
      mainEntityMetadata: MainEntity,
      dependencyMetadata: DependencyEntity
    ) => DependencyRelationship
  ): Promise<(MainRelationship | DependencyRelationship)[]> {
    const batchGetResult = (await this._aws.helpers.ddb
      .get([mainEntityId, ...dependencyIds])
      .execute()) as BatchGetItemCommandOutput;
    const mainEntityMetadata = batchGetResult.Responses![this._tableName].find((item) => {
      const metaDataItem = metadataParser.parse(item);
      return metaDataItem.pk === mainEntityId.pk && metaDataItem.sk === mainEntityId.sk;
    });
    const dependenciesMetadata = batchGetResult.Responses![this._tableName].filter(
      (item) => item !== mainEntityMetadata
    );

    const relationshipItems: (MainRelationship | DependencyRelationship)[] = [];
    dependenciesMetadata.forEach((dependency) => {
      const mainEntity = mainEntityMapper(mainEntityMetadata);
      const dependencyEntity = dependencyEntityMapper(dependency);
      relationshipItems.push(mainRelationshipMapper(mainEntity, dependencyEntity));
      if (dependencyRelationshipMapper)
        relationshipItems.push(dependencyRelationshipMapper(mainEntity, dependencyEntity));
    });
    return relationshipItems;
  }
}
