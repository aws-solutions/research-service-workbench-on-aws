/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateKeyPairRequest,
  DeleteKeyPairRequest,
  GetKeyPairRequest,
  ListKeyPairsRequest,
  SendPublicKeyRequest
} from '@aws/swb-app';
import { DynamoDBService, PaginatedResponse, QueryParams } from '@aws/workbench-core-base';
import Deleter from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/deleter';
import PaginatedJsonResponse from '@aws/workbench-core-base/lib/interfaces/paginatedJsonResponse';
import { DatabaseError } from '../errors/databaseError';
import { NoKeyExistsError } from '../errors/noKeyExistsError';
import { NonUniqueKeyError } from '../errors/nonUniqueKeyError';
import KeyPairService from './keyPairService';

describe('KeyPairService', () => {
  const region = 'us-east-1';
  const dynamoDBService = {} as DynamoDBService;
  const keyPairService: KeyPairService = new KeyPairService(dynamoDBService);

  beforeAll(() => {
    process.env.AWS_REGION = region;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getKeyPair', () => {
    let getKeyPairRequest: GetKeyPairRequest;

    beforeEach(() => {
      getKeyPairRequest = { projectId: '' };
    });

    test('should throw not implemented error', async () => {
      await expect(() => keyPairService.getKeyPair(getKeyPairRequest)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('listKeyPairs', () => {
    let listKeyPairsRequest: ListKeyPairsRequest;

    beforeEach(() => {
      listKeyPairsRequest = { userId: '' };
    });

    test('should throw not implemented error', async () => {
      await expect(() => keyPairService.listKeyPairs(listKeyPairsRequest)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('deleteKeyPair', () => {
    let deleteKeyPairRequest: DeleteKeyPairRequest;

    beforeEach(() => {
      deleteKeyPairRequest = { projectId: 'proj-123', userId: 'user-123' };
    });

    describe('when no key exists', () => {
      beforeEach(() => {
        const queryResponse = { data: [] };
        dynamoDBService.getPaginatedItems = jest.fn((params: QueryParams): Promise<PaginatedJsonResponse> => {
          return Promise.resolve(queryResponse);
        });
      });

      test('it throws NoKeyExistsError', async () => {
        // OPERATE n CHECK
        await expect(() => keyPairService.deleteKeyPair(deleteKeyPairRequest)).rejects.toThrow(
          NoKeyExistsError
        );
      });
    });

    describe('when no unique key exists', () => {
      beforeEach(() => {
        const queryResponse = {
          data: [
            {
              pk: 'SSH#ssh-123',
              sk: 'USER#user-123',
              dependency: 'proj-123'
            },
            { pk: 'SSH#ssh-456', sk: 'USER#user-123', dependency: 'proj-123' }
          ]
        };
        dynamoDBService.getPaginatedItems = jest.fn((params: QueryParams): Promise<PaginatedJsonResponse> => {
          return Promise.resolve(queryResponse);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // jest.spyOn(DynamoDBService.prototype as any, 'getPaginatedItems').mockImplementationOnce(() => queryResponse);
      });

      test('it throws NonUniqueKeyQuery', async () => {
        // OPERATE n CHECK
        await expect(() => keyPairService.deleteKeyPair(deleteKeyPairRequest)).rejects.toThrow(
          NonUniqueKeyError
        );
      });
    });

    // describe('when key exists', () => {
    //     beforeEach(() => {
    //         const queryResponse = {data: [{pk: 'SSH#ssh-123', sk: 'USER#user-123', dependency: 'proj-123'}]};
    //         dynamoDBService.getPaginatedItems = jest.fn((params: QueryParams) :  Promise<PaginatedJsonResponse> => {
    //             return Promise.resolve(queryResponse);
    //         });
    //     })
    //
    //     describe('and DDB Delete call succeeds', () => {
    //         beforeEach(() => {
    //             // TODO: fix after good delete method
    //             jest.spyOn(Deleter.prototype as any, 'execute').mockImplementationOnce(() => {});
    //         });
    //
    //         test('nothing fails', async () => {
    //             // OPERATE n CHECK
    //             await expect(keyPairService.deleteKeyPair(deleteKeyPairRequest)).resolves.not.toThrow();
    //         })
    //     })
    //     describe('and DDB Delete call fails', () => {
    //         beforeEach(async () => {
    //             // TODO: fix after good delete method
    //             jest.spyOn(Deleter.prototype as any, 'execute').mockRejectedValueOnce('ddb error');
    //         })
    //         test('it fails', async () => {
    //             // OPERATE n CHECK
    //             await expect(() => keyPairService.deleteKeyPair(deleteKeyPairRequest)).rejects.toThrow(DatabaseError);
    //         })
    //     })
    // })
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
