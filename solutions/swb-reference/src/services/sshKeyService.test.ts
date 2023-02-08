/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateSshKeyRequest,
  DeleteSshKeyRequest,
  ListUserSshKeysForProjectRequest,
  SendPublicKeyRequest,
  DatabaseError,
  NonUniqueKeyError,
  NoKeyExistsError,
  SshKey
} from '@aws/swb-app';
import { AwsService } from '@aws/workbench-core-base';
import SshKeyService from './sshKeyService';

describe('SshKeyService', () => {
  const region = 'us-east-1';
  const aws = {} as AwsService;
  const sshKeyService: SshKeyService = new SshKeyService(aws);
  let sshKey: SshKey;

  beforeAll(() => {
    process.env.AWS_REGION = region;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sshKey = {
      sshKeyId: 'ssh-123',
      createTime: 'date-123',
      projectId: 'proj-123',
      owner: 'user-123',
      publicKey: 'SSH#EXAMPLEKEY'
    };
  });

  describe('listUserSshKeysForProject', () => {
    let listUserSshKeysForProjectRequest: ListUserSshKeysForProjectRequest;

    beforeEach(() => {
      listUserSshKeysForProjectRequest = { projectId: 'proj-123', userId: 'user-123' };
    });

    describe('when no key exists', () => {
      test.skip('it throws NoKeyExistsError', async () => {
        // OPERATE n CHECK
        await expect(() =>
          sshKeyService.listUserSshKeysForProject(listUserSshKeysForProjectRequest)
        ).rejects.toThrow(NoKeyExistsError);
      });
    });

    describe('when multiple keys exists', () => {
      test.skip('it throws NonUniqueKeyQuery', async () => {
        // OPERATE n CHECK
        await expect(() =>
          sshKeyService.listUserSshKeysForProject(listUserSshKeysForProjectRequest)
        ).rejects.toThrow(NonUniqueKeyError);
      });
    });

    describe('when unique key exists', () => {
      test.skip('key is returned', async () => {
        // OPERATE
        const actualResponse = await sshKeyService.listUserSshKeysForProject(
          listUserSshKeysForProjectRequest
        );

        // CHECK
        expect(actualResponse).toEqual({ keyPair: sshKey });
      });
    });

    test('should throw not implemented error', async () => {
      await expect(() =>
        sshKeyService.listUserSshKeysForProject(listUserSshKeysForProjectRequest)
      ).rejects.toThrow(new Error('Method not implemented.'));
    });
  });

  describe('deleteSshKey', () => {
    let deleteSshKeyRequest: DeleteSshKeyRequest;

    beforeEach(() => {
      deleteSshKeyRequest = { projectId: 'proj-123', sshKeyId: 'key-user-123#proj-123' };
    });

    describe('when unique key exists', () => {
      describe('and DDB Delete call succeeds', () => {
        test.skip('nothing fails', async () => {
          // OPERATE n CHECK
          await expect(sshKeyService.deleteSshKey(deleteSshKeyRequest)).resolves.not.toThrow();
        });
      });

      describe('and DDB Delete call fails', () => {
        test.skip('it fails', async () => {
          // OPERATE n CHECK
          await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(DatabaseError);
        });
      });
    });

    test('should throw not implemented error', async () => {
      await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('createSshKey', () => {
    let createSshKeyRequest: CreateSshKeyRequest;

    beforeEach(() => {
      createSshKeyRequest = { projectId: '', userId: '' };
    });

    test('should throw not implemented error', async () => {
      await expect(() => sshKeyService.createSshKey(createSshKeyRequest)).rejects.toThrow(
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
      await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });
});
