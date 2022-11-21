/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { MetadataService } from './metadataService';

describe('metadata service', () => {
  const metadataService = new MetadataService();
  interface EntityTest {
    id: string;
    sk: string;
    pk: string;
  }
  interface EntityA extends EntityTest {
    productName: string;
  }
  interface EntityB extends EntityTest {
    projectName: string;
    projectType: string;
  }
  interface EntityAMetadata extends EntityTest {
    entityBProject: string;
    entityBProjectType: string;
  }
  interface EntityBMetadata extends EntityTest {
    entityAProduct: string;
  }
  const mapperA = (entityA: EntityA, entityB: EntityB): EntityAMetadata => {
    return {
      id: entityB.id,
      sk: entityB.pk,
      pk: entityA.pk,
      entityBProject: entityB.projectName,
      entityBProjectType: entityB.projectType
    };
  };
  const mapperB = (entityA: EntityA, entityB: EntityB): EntityBMetadata => {
    return { id: entityA.id, sk: entityA.pk, pk: entityB.pk, entityAProduct: entityA.productName };
  };
  const entityA: EntityA = { id: 'etityAId', sk: 'etityASk', pk: 'etityAPk', productName: 'Product' };
  const entityB: EntityB = {
    id: 'etityBId',
    sk: 'etityBSk',
    pk: 'etityBPk',
    projectName: 'Project',
    projectType: 'Type 1'
  };
  test('should return mapping metadata successfully', () => {
    const result: { mainEntityMetadata: EntityAMetadata[]; dependencyMetadata: EntityBMetadata[] } = {
      mainEntityMetadata: [
        {
          id: entityB.id,
          sk: entityB.pk,
          pk: entityA.pk,
          entityBProject: entityB.projectName,
          entityBProjectType: entityB.projectType
        }
      ],
      dependencyMetadata: [
        {
          id: entityA.id,
          sk: entityA.pk,
          pk: entityB.pk,
          entityAProduct: entityA.productName
        }
      ]
    };

    expect(metadataService.getMetadataItems(entityA, [entityB], mapperA, mapperB)).toMatchObject(result);
  });
});
