/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AttributeValue, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import { z } from 'zod';
import DynamoDBService from '../aws/helpers/dynamoDB/dynamoDBService';
import Query from '../aws/helpers/dynamoDB/query';
import TransactEdit from '../aws/helpers/dynamoDB/transactEdit';
import resourceTypeToKey from '../constants/resourceTypeToKey';
import { RelationshipDDBItemParser } from '../types/relationshipDDBItem';
import { MetadataService } from './metadataService';

describe('metadata service', () => {
  let ddbService: DynamoDBService;
  let metadataService: MetadataService;

  beforeEach(() => {
    ddbService = new DynamoDBService({ region: 'test', table: 'test' });
    metadataService = new MetadataService(ddbService);
    jest.resetAllMocks();
  });

  test('should return mapping metadata successfully', () => {
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

    expect(metadataService.getMetadataItems(entityA, [entityB], mapperA, mapperB)).toStrictEqual(result);
  });

  test('should list dependent entity metadata', async () => {
    const expected: Record<string, AttributeValue>[] = [{ a: { N: '123.45' } }];

    const output: QueryCommandOutput = { $metadata: {}, Items: expected };

    const query = new Query({ region: 'test' }, 'test');
    query.execute = jest.fn(() => Promise.resolve(output));
    ddbService.query = jest.fn(() => query);

    const parser = z
      .object({
        a: z.any()
      })
      .strict();

    const { data: result } = await metadataService.listDependentMetadata(
      resourceTypeToKey.environment,
      'id',
      resourceTypeToKey.dataset,
      parser
    );
    expect(result).toEqual(expected);
  });

  describe('updateRelationship tests', () => {
    test('transact edit not called when no dependency ids are passed', async () => {
      ddbService.transactEdit = jest.fn();

      await metadataService.updateRelationship(
        resourceTypeToKey.environment,
        { id: 'id', data: { a: 1 } },
        resourceTypeToKey.dataset,
        []
      );

      expect(ddbService.transactEdit).toBeCalledTimes(0);
    });

    test('throws exception if more than 50 items passed', async () => {
      const edit = new TransactEdit({ region: 'test' }, 'test');
      edit.addPutRequests = jest.fn();
      edit.execute = jest.fn();
      ddbService.transactEdit = jest.fn(() => edit);

      await expect(
        metadataService.updateRelationship(
          resourceTypeToKey.environment,
          { id: 'id', data: { a: 1 } },
          resourceTypeToKey.dataset,
          Array.from({ length: 51 }, (v, k) => {
            return { id: k.toString() };
          })
        )
      ).rejects.toThrow('Cannot add more than 50 dependencies in single transaction.');
    });

    test('updateRelationship calls transaction execute', async () => {
      const edit = new TransactEdit({ region: 'test' }, 'test');
      edit.addPutRequests = jest.fn();
      edit.execute = jest.fn();
      ddbService.transactEdit = jest.fn(() => edit);

      await metadataService.updateRelationship(
        resourceTypeToKey.environment,
        { id: 'id', data: { a: 1 } },
        resourceTypeToKey.dataset,
        [{ id: 'dependentId1' }, { id: 'dependentId2' }]
      );
      expect(edit.execute).toBeCalledTimes(1);
    });
  });

  describe('deleteRelationships tests', () => {
    test('transact edit not called when no dependency ids are passed', async () => {
      ddbService.transactEdit = jest.fn();

      await metadataService.deleteRelationships(
        resourceTypeToKey.environment,
        'id',
        resourceTypeToKey.dataset,
        []
      );

      expect(ddbService.transactEdit).toBeCalledTimes(0);
    });

    test('throws exception if more than 50 items passed', async () => {
      const edit = new TransactEdit({ region: 'test' }, 'test');
      edit.addPutRequests = jest.fn();
      edit.execute = jest.fn();
      ddbService.transactEdit = jest.fn(() => edit);

      await expect(
        metadataService.deleteRelationships(
          resourceTypeToKey.environment,
          'id',
          resourceTypeToKey.dataset,
          Array.from({ length: 51 })
        )
      ).rejects.toThrow('Cannot delete more than 50 dependencies in single transaction.');
    });

    test('deleteRelationships calls transaction execute', async () => {
      const edit = new TransactEdit({ region: 'test' }, 'test');
      edit.addPutRequests = jest.fn();
      edit.execute = jest.fn();
      ddbService.transactEdit = jest.fn(() => edit);

      await metadataService.deleteRelationships(
        resourceTypeToKey.environment,
        'id',
        resourceTypeToKey.dataset,
        ['dependentId1', 'dependentId2']
      );

      expect(edit.execute).toBeCalledTimes(1);
    });
  });

  describe('getMetadataItem', () => {
    test('returns item when exists', async () => {
      ddbService.getItem = jest.fn().mockReturnValueOnce({ pk: 'pk', sk: 'sk', id: 'id' });

      const actualResponse = await metadataService.getMetadataItem(
        'mainEntityResourceType',
        'mainEntityId',
        'dependencyResourceType',
        'dependencyId',
        RelationshipDDBItemParser
      );
      expect(actualResponse).toEqual({ pk: 'pk', sk: 'sk', id: 'id' });
    });

    test('returns undefined when item is not found', async () => {
      ddbService.getItem = jest.fn().mockReturnValueOnce(undefined);

      await expect(
        metadataService.getMetadataItem(
          'mainEntityResourceType',
          'mainEntityId',
          'dependencyResourceType',
          'dependencyId',
          RelationshipDDBItemParser
        )
      ).resolves.toEqual(undefined);
    });
  });
});
