/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class MetadataService {
  public constructor() {}
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
}
