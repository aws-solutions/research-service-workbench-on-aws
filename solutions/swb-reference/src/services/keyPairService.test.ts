/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateKeyPairRequest,
  DeleteKeyPairRequest,
  GetKeyPairRequest,
  SendPublicKeyRequest,
  DatabaseError,
  NonUniqueKeyError,
  NoKeyExistsError,
  KeyPair
} from '@aws/swb-app';
import { DynamoDBService, JSONValue } from '@aws/workbench-core-base';
import PaginatedJsonResponse from '@aws/workbench-core-base/lib/interfaces/paginatedJsonResponse';
import _ from 'lodash';
import KeyPairService from './keyPairService';

describe('KeyPairService', () => {
  const region = 'us-east-1';
  const dynamoDBService = {} as DynamoDBService;
  const keyPairService: KeyPairService = new KeyPairService(dynamoDBService);
  let keyPair: KeyPair;

  beforeAll(() => {
    process.env.AWS_REGION = region;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    keyPair = {
      id: 'ssh-123',
      createdAt: 'date-123',
      projectId: 'proj-123',
      owner: 'user-123',
      publicKey: 'SSH#EXAMPLEKEY',
      updatedAt: 'date-456'
    };
  });

  describe('getKeyPair', () => {
    let getKeyPairRequest: GetKeyPairRequest;

    beforeEach(() => {
      getKeyPairRequest = { projectId: 'proj-123', userId: 'user-123' };
    });

    describe('when no key exists', () => {
      beforeEach(() => {
        const queryResponse = { data: [] };
        dynamoDBService.getPaginatedItems = jest.fn((): Promise<PaginatedJsonResponse> => {
          return Promise.resolve(queryResponse);
        });
      });

      test('it throws NoKeyExistsError', async () => {
        // OPERATE n CHECK
        await expect(() => keyPairService.getKeyPair(getKeyPairRequest)).rejects.toThrow(NoKeyExistsError);
      });
    });

    describe('when multiple keys exists', () => {
      beforeEach(() => {
        const queryResponse = {
          data: [
            {
              pk: 'SSH#ssh-123',
              sk: 'USER#user-123',
              dependency: 'proj-123'
            },
            {
              pk: 'SSH#ssh-456',
              sk: 'USER#user-123',
              dependency: 'proj-123'
            }
          ]
        };
        dynamoDBService.getPaginatedItems = jest.fn((): Promise<PaginatedJsonResponse> => {
          return Promise.resolve(queryResponse);
        });
      });

      test('it throws NonUniqueKeyQuery', async () => {
        // OPERATE n CHECK
        await expect(() => keyPairService.getKeyPair(getKeyPairRequest)).rejects.toThrow(NonUniqueKeyError);
      });
    });

    describe('when unique key exists', () => {
      beforeEach(() => {
        const queryResponse = {
          data: [
            {
              pk: 'SSH#ssh-123',
              sk: 'USER#user-123',
              dependency: 'proj-123',
              ..._.omit(keyPair, ['projectId'])
            }
          ]
        };
        dynamoDBService.getPaginatedItems = jest.fn((): Promise<PaginatedJsonResponse> => {
          return Promise.resolve(queryResponse);
        });
      });

      test('key is returned', async () => {
        // OPERATE
        const actualResponse = await keyPairService.getKeyPair(getKeyPairRequest);

        // CHECK
        expect(actualResponse).toEqual({ keyPair });
      });
    });
  });

  describe('deleteKeyPair', () => {
    let deleteKeyPairRequest: DeleteKeyPairRequest;

    beforeEach(() => {
      deleteKeyPairRequest = { projectId: 'proj-123', userId: 'user-123' };
    });

    describe('when unique key exists', () => {
      beforeEach(() => {
        const queryResponse = {
          data: [
            {
              pk: 'SSH#ssh-123',
              sk: 'USER#user-123',
              dependency: 'proj-123',
              ..._.omit(keyPair, ['projectId'])
            }
          ]
        };
        dynamoDBService.getPaginatedItems = jest.fn((): Promise<PaginatedJsonResponse> => {
          return Promise.resolve(queryResponse);
        });
      });

      describe('and DDB Delete call succeeds', () => {
        beforeEach(() => {
          dynamoDBService.deleteItem = jest.fn((): Promise<Record<string, JSONValue>> => {
            return Promise.resolve({});
          });
        });

        test('nothing fails', async () => {
          // OPERATE n CHECK
          await expect(keyPairService.deleteKeyPair(deleteKeyPairRequest)).resolves.not.toThrow();
        });
      });

      describe('and DDB Delete call fails', () => {
        beforeEach(() => {
          dynamoDBService.deleteItem = jest.fn((): Promise<Record<string, JSONValue>> => {
            return Promise.reject({});
          });
        });

        test('it fails', async () => {
          // OPERATE n CHECK
          await expect(() => keyPairService.deleteKeyPair(deleteKeyPairRequest)).rejects.toThrow(
            DatabaseError
          );
        });
      });
    });
  });

  describe('createKeyPair', () => {
    let createKeyPairRequest: CreateKeyPairRequest;

    beforeEach(() => {
      createKeyPairRequest = { projectId: '' };
    });

    test('should throw not implemented error', async () => {
      await expect(() => keyPairService.createKeyPair(createKeyPairRequest)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('sendPublicKey', () => {
    let sendPublicKeyRequest: SendPublicKeyRequest;

    beforeEach(() => {
      sendPublicKeyRequest = { environmentId: '' };
    });

    test('should throw not implemented error', async () => {
      await expect(() => keyPairService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });
});
