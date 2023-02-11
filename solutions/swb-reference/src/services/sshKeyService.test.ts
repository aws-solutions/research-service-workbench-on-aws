/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EC2 } from '@aws-sdk/client-ec2';
import {
  CreateSshKeyRequest,
  DeleteSshKeyRequest,
  Ec2Error,
  ListUserSshKeysForProjectRequest,
  NoKeyExistsError,
  NonUniqueKeyError,
  SendPublicKeyRequest,
  SshKey
} from '@aws/swb-app';
import { Project, ProjectService } from '@aws/workbench-core-accounts';
import { ProjectStatus } from '@aws/workbench-core-accounts/lib/constants/projectStatus';
import { ForbiddenError } from '@aws/workbench-core-authorization';
import { AwsService } from '@aws/workbench-core-base';
import SshKeyService from './sshKeyService';

describe('SshKeyService', () => {
  const region = 'us-east-1';
  const aws = {} as AwsService;
  const projectService = {} as ProjectService;
  const sshKeyService: SshKeyService = new SshKeyService(aws, projectService);
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

    describe('when project does not exist', () => {
      beforeEach(() => {
        projectService.getProject = jest.fn(() => {
          throw new Error(`Could not find project ${listUserSshKeysForProjectRequest.projectId}`);
        });
      });
    });

    describe('when project exists', () => {
      const hostSdk = { clients: {} } as AwsService;
      const hostEc2 = {} as EC2;

      beforeEach(() => {
        const project: Project = {
          id: listUserSshKeysForProjectRequest.projectId,
          name: '',
          description: '',
          costCenterId: '',
          status: ProjectStatus.AVAILABLE,
          createdAt: '',
          updatedAt: '',
          awsAccountId: '',
          envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
          hostingAccountHandlerRoleArn: '',
          vpcId: '',
          subnetId: '',
          environmentInstanceFiles: '',
          encryptionKeyArn: '',
          externalId: 'sampleExternalId',
          accountId: ''
        };
        projectService.getProject = jest.fn(() => Promise.resolve(project));
        hostSdk.clients.ec2 = hostEc2;
      });
      describe('but EC2 call fails', () => {
        beforeEach(() => {
          hostEc2.describeKeyPairs = jest.fn(() => Promise.reject('Some EC2 thrown error'));
          aws.getAwsServiceForRole = jest.fn(() => Promise.resolve(hostSdk));
        });

        test('it throws Ec2Error', async () => {
          // OPERATE n CHECK
          await expect(() =>
            sshKeyService.listUserSshKeysForProject(listUserSshKeysForProjectRequest)
          ).rejects.toThrow(Ec2Error);
        });
      });

      //TO DO
      describe('and EC2 call succeeds', () => {
        beforeEach(() => {
          // hostEc2.SendSSHPublicKey = jest.fn(() => Promise.resolve({ $metadata: {} }));
          hostEc2.describeKeyPairs = jest.fn(() => Promise.resolve({ $metadata: {} }));
        });
        test('it succeeds, and return the correct values', async () => {
          // arrange
          const mockResponse = {
            sshKeys: [sshKey]
          };
          // act
          const actualResponse = await sshKeyService.listUserSshKeysForProject(
            listUserSshKeysForProjectRequest
          );
          // assert
          expect(actualResponse).toEqual(mockResponse);
        });
      });
    });
  });

  describe('deleteSshKey', () => {
    let deleteSshKeyRequest: DeleteSshKeyRequest;

    beforeEach(() => {
      deleteSshKeyRequest = {
        projectId: 'proj-123',
        sshKeyId: 'sshkey-user-123#proj-123',
        currentUserId: 'user-123'
      };
    });

    describe('when current user does not own the key they want to delete', () => {
      beforeEach(() => {
        deleteSshKeyRequest.currentUserId = 'user-456';
      });

      test('it throws ForbiddenError', async () => {
        // OPERATE n CHECK
        await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(ForbiddenError);
      });
    });

    describe('when current user owned the key they want to delete', () => {
      describe('but project does not exist', () => {
        beforeEach(() => {
          projectService.getProject = jest.fn(() => {
            throw new Error(`Could not find project ${deleteSshKeyRequest.projectId}`);
          });
        });

        test('it throws', async () => {
          // OPERATE n CHECK
          await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(
            `Could not find project ${deleteSshKeyRequest.projectId}`
          );
        });
      });

      describe('and project exists', () => {
        const hostSdk = { clients: {} } as AwsService;
        const hostEc2 = {} as EC2;

        beforeEach(() => {
          const project: Project = {
            id: deleteSshKeyRequest.projectId,
            name: '',
            description: '',
            costCenterId: '',
            status: ProjectStatus.AVAILABLE,
            createdAt: '',
            updatedAt: '',
            awsAccountId: '',
            envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
            hostingAccountHandlerRoleArn: '',
            vpcId: '',
            subnetId: '',
            environmentInstanceFiles: '',
            encryptionKeyArn: '',
            externalId: 'sampleExternalId',
            accountId: ''
          };
          projectService.getProject = jest.fn(() => Promise.resolve(project));
          hostSdk.clients.ec2 = hostEc2;
        });

        describe('but EC2 call fails', () => {
          beforeEach(() => {
            hostEc2.deleteKeyPair = jest.fn(() => Promise.reject('Some EC2 thrown error'));
            aws.getAwsServiceForRole = jest.fn(() => Promise.resolve(hostSdk));
          });

          test('it throws Ec2Error', async () => {
            // OPERATE n CHECK
            await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(Ec2Error);
          });
        });

        describe('and EC2 call succeeds', () => {
          beforeEach(() => {
            hostEc2.deleteKeyPair = jest.fn(() => Promise.resolve({ $metadata: {} }));
          });

          test('it succeeds, nothing is returned', async () => {
            // OPERATE n CHECK
            await expect(sshKeyService.deleteSshKey(deleteSshKeyRequest)).resolves.not.toThrow();
          });
        });
      });
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
