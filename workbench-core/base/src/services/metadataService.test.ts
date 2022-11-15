/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { MetadataService } from './metadataService';

describe('metadata service', () => {
  const metadataService = new MetadataService();
  interface EntityA {
    id: string;
    sk: string;
    pk: string;
    productName: string;
  }
  interface EntityB {
    id: string;
    sk: string;
    pk: string;
    projectName: string;
    projectType: string;
  }
  interface EntityAMetadata {
    id: string;
    sk: string;
    pk: string;
    projectName: string;
    projectType: string;
  }
  interface EntityBMetadata {
    id: string;
    sk: string;
    pk: string;
    productName: string;
  }
  const mapperA = (entityA: EntityA, entityB: EntityB): EntityAMetadata => {
    return {
      id: entityB.id,
      sk: entityB.pk,
      pk: entityA.pk,
      projectName: entityB.projectName,
      projectType: entityB.projectType
    };
  };
  const mapperB = (entityA: EntityA, entityB: EntityB): EntityBMetadata => {
    return { id: entityA.id, sk: entityA.pk, pk: entityB.pk, productName: entityA.productName };
  };
  const entityA = { id: 'etityAId', sk: 'etityASk', pk: 'etityAPk', productName: 'Product' };
  const entityB = {
    id: 'etityBId',
    sk: 'etityBSk',
    pk: 'etityBPk',
    projectName: 'Project',
    projectType: 'Type 1'
  };
  test('should return mapping metadata successfully', () => {
    const result = {
      mainEntityMetadata: [
        {
          id: entityB.id,
          sk: entityB.pk,
          pk: entityA.pk,
          projectName: entityB.projectName,
          projectType: entityB.projectType
        }
      ],
      dependencyMetadata: [
        {
          id: entityA.id,
          sk: entityA.pk,
          pk: entityB.pk,
          productName: entityA.productName
        }
      ]
    };

    expect(metadataService.getMetadataItems(entityA, [entityB], mapperA, mapperB)).toMatchObject(result);
  });
});
