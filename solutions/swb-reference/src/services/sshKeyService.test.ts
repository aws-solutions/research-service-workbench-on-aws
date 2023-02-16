/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const mockSshKeyId = 'mockvalues';
jest.mock('crypto', () => {
  return {
    createHash: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => mockSshKeyId)
  };
});

import { EC2, KeyPairInfo } from '@aws-sdk/client-ec2';
import {
  AwsServiceError,
  CreateSshKeyRequest,
  DeleteSshKeyRequest,
  Ec2Error,
  ListUserSshKeysForProjectRequest,
  ListUserSshKeysForProjectResponse,
  NoKeyExistsError,
  NonUniqueKeyError,
  SendPublicKeyRequest
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

  beforeAll(() => {
    process.env.AWS_REGION = region;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('listUserSshKeysForProject', () => {
    let listUserSshKeysForProjectRequest: ListUserSshKeysForProjectRequest;
    beforeEach(() => {
      listUserSshKeysForProjectRequest = {
        projectId: 'proj-123',
        userId: 'user-123'
      };
    });

    describe('when project does not exist', () => {
      beforeEach(() => {
        projectService.getProject = jest.fn(() => {
          throw new Error(`Could not find project ${listUserSshKeysForProjectRequest.projectId}`);
        });
      });

      test('it throws', async () => {
        // OPERATE n CHECK
        await expect(() =>
          sshKeyService.listUserSshKeysForProject(listUserSshKeysForProjectRequest)
        ).rejects.toThrow(`Could not find project ${listUserSshKeysForProjectRequest.projectId}`);
      });
    });

    describe('when project exists', () => {
      const hostSdk = { clients: {} } as AwsService;
      const hostEc2 = {} as EC2;
      let project: Project;
      beforeEach(() => {
        project = {
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
      describe('but cannot get EC2 client', () => {
        beforeEach(() => {
          aws.getAwsServiceForRole = jest.fn(() => Promise.reject('Could not get EC2 client'));
        });

        test('it throws AwsServiceError', async () => {
          // OPERATE n CHECK
          await expect(() =>
            sshKeyService.listUserSshKeysForProject(listUserSshKeysForProjectRequest)
          ).rejects.toThrow(AwsServiceError);
        });
      });

      describe('and successfully got EC2 client', () => {
        beforeEach(() => {
          aws.getAwsServiceForRole = jest.fn(() => Promise.resolve(hostSdk));
        });

        describe('but get EC2 call fails', () => {
          beforeEach(() => {
            hostEc2.describeKeyPairs = jest.fn(() => Promise.reject('Some EC2 thrown error'));
          });

          test('it throws Ec2Error', async () => {
            // OPERATE n CHECK
            await expect(() =>
              sshKeyService.listUserSshKeysForProject(listUserSshKeysForProjectRequest)
            ).rejects.toThrow(Ec2Error);
          });
        });

        describe('and get EC2 call succeeds', () => {
          let mockCreateTime: Date;
          let mockPublicKey: string;
          let mockKeyName: string;
          let mockResponse: ListUserSshKeysForProjectResponse;
          let keyPairs: KeyPairInfo[];

          beforeEach(() => {
            mockCreateTime = new Date();
            mockPublicKey = 'SSH#EXAMPLEKEY';
            mockKeyName = `sshkey-${mockSshKeyId}`;
          });

          describe('and no key exist', () => {
            beforeEach(() => {
              keyPairs = [];
              hostEc2.describeKeyPairs = jest.fn(() =>
                Promise.resolve({ $metadata: {}, KeyPairs: keyPairs })
              );
            });

            test('it succeeds, and response with an empty list of sshKeys is returned', async () => {
              // BUILD
              mockResponse = { sshKeys: [] };
              // OPERATE
              const actualResponse = await sshKeyService.listUserSshKeysForProject(
                listUserSshKeysForProjectRequest
              );
              // CHECK
              expect(actualResponse).toEqual(mockResponse);
            });
          });

          describe('and multiple keys exists', () => {
            beforeEach(() => {
              keyPairs = [
                { PublicKey: mockPublicKey, CreateTime: mockCreateTime, KeyName: mockKeyName },
                { PublicKey: mockPublicKey, CreateTime: mockCreateTime, KeyName: mockKeyName }
              ];
              hostEc2.describeKeyPairs = jest.fn(() =>
                Promise.resolve({ $metadata: {}, KeyPairs: keyPairs })
              );
            });

            test('it succeeds, and response with a list of multiple sshKeys is returned', async () => {
              // BUILD
              mockResponse = { sshKeys: [] };
              keyPairs.forEach((key) => {
                mockResponse.sshKeys.push({
                  sshKeyId: mockKeyName,
                  createTime: mockCreateTime.toISOString(),
                  projectId: listUserSshKeysForProjectRequest.projectId,
                  owner: listUserSshKeysForProjectRequest.userId,
                  publicKey: mockPublicKey
                });
              });
              //OPERATE
              const actualResponse = await sshKeyService.listUserSshKeysForProject(
                listUserSshKeysForProjectRequest
              );
              //CHECK
              expect(actualResponse).toEqual(mockResponse);
            });
          });

          describe('and there is one unique key', () => {
            beforeEach(() => {
              keyPairs = [{ PublicKey: mockPublicKey, CreateTime: mockCreateTime, KeyName: mockKeyName }];
              hostEc2.describeKeyPairs = jest.fn(() =>
                Promise.resolve({ $metadata: {}, KeyPairs: keyPairs })
              );
            });

            test('it succeeds, and response with a list of one unique sshKeys is returned', async () => {
              // BUILD
              mockResponse = {
                sshKeys: [
                  {
                    sshKeyId: `sshkey-${mockSshKeyId}`,
                    createTime: mockCreateTime.toISOString(),
                    projectId: listUserSshKeysForProjectRequest.projectId,
                    owner: listUserSshKeysForProjectRequest.userId,
                    publicKey: mockPublicKey
                  }
                ]
              };
              // OPERATE
              const actualResponse = await sshKeyService.listUserSshKeysForProject(
                listUserSshKeysForProjectRequest
              );
              // CHECK
              expect(actualResponse).toEqual(mockResponse);
            });
          });
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

    describe('when project does not exist', () => {
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

    describe('when project exists', () => {
      const hostSdk = { clients: {} } as AwsService;
      const hostEc2 = {} as EC2;
      let project: Project;

      beforeEach(() => {
        project = {
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

      describe('but cannot get EC2 client', () => {
        beforeEach(() => {
          aws.getAwsServiceForRole = jest.fn(() => Promise.reject('Could not get EC2 client'));
        });

        test('it throws AwsServiceError', async () => {
          // OPERATE n CHECK
          await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(
            AwsServiceError
          );
        });
      });

      describe('and successfully got EC2 client', () => {
        beforeEach(() => {
          aws.getAwsServiceForRole = jest.fn(() => Promise.resolve(hostSdk));
        });

        describe('but get EC2 call fails', () => {
          beforeEach(() => {
            hostEc2.describeKeyPairs = jest.fn(() => Promise.reject('Some EC2 thrown error'));
          });

          test('it throws Ec2Error', async () => {
            // OPERATE n CHECK
            await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(Ec2Error);
          });
        });

        describe('and get EC2 call succeeds', () => {
          beforeEach(() => {
            const keyPairs = [{ Tags: [{ Key: 'user', Value: `${deleteSshKeyRequest.currentUserId}` }] }];
            hostEc2.describeKeyPairs = jest.fn(() => Promise.resolve({ $metadata: {}, KeyPairs: keyPairs }));
          });

          describe('but no key exists', () => {
            beforeEach(() => {
              hostEc2.describeKeyPairs = jest.fn(() => Promise.resolve({ $metadata: {}, KeyPairs: [] }));
            });

            test('it throws NoKeyExistsError', async () => {
              // OPERATE n CHECK
              await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(
                NoKeyExistsError
              );
            });
          });

          describe('but multiple keys exists', () => {
            beforeEach(() => {
              const keyPairs = [
                { Tags: [{ Key: 'user', Value: `${deleteSshKeyRequest.currentUserId}` }] },
                { Tags: [{ Key: 'user', Value: `${deleteSshKeyRequest.currentUserId}` }] }
              ];
              hostEc2.describeKeyPairs = jest.fn(() =>
                Promise.resolve({ $metadata: {}, KeyPairs: keyPairs })
              );
            });

            test('it throws NonUniqueKeyError', async () => {
              // OPERATE n CHECK
              await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(
                NonUniqueKeyError
              );
            });
          });

          describe('but current user does not own the key they want to delete', () => {
            beforeEach(() => {
              deleteSshKeyRequest.currentUserId = 'user-456';
            });

            test('it throws ForbiddenError', async () => {
              // OPERATE n CHECK
              await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(
                ForbiddenError
              );
            });
          });

          describe('and current user owns the existing, unique key they want to delete', () => {
            describe('but delete EC2 call fails', () => {
              beforeEach(() => {
                hostEc2.deleteKeyPair = jest.fn(() => Promise.reject('Some EC2 thrown error'));
              });

              test('it throws Ec2Error', async () => {
                // OPERATE n CHECK
                await expect(() => sshKeyService.deleteSshKey(deleteSshKeyRequest)).rejects.toThrow(Ec2Error);
              });
            });

            describe('and get EC2 call succeeds', () => {
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
    });
  });

  describe('createSshKey', () => {
    let createSshKeyRequest: CreateSshKeyRequest;

    beforeEach(() => {
      createSshKeyRequest = { projectId: 'proj-123', userId: '1234' };
    });

    describe('when project does not exist', () => {
      beforeEach(() => {
        projectService.getProject = jest.fn(() => {
          throw new Error(`Could not find project ${createSshKeyRequest.projectId}`);
        });
      });

      test('it throws', async () => {
        // OPERATE n CHECK
        await expect(() => sshKeyService.createSshKey(createSshKeyRequest)).rejects.toThrow(
          `Could not find project ${createSshKeyRequest.projectId}`
        );
      });
    });

    describe('when project exists', () => {
      const hostSdk = { clients: {} } as AwsService;
      const hostEc2 = {} as EC2;
      let project: Project;

      beforeEach(() => {
        project = {
          id: createSshKeyRequest.projectId,
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

      describe('but cannot get EC2 client', () => {
        beforeEach(() => {
          aws.getAwsServiceForRole = jest.fn(() => Promise.reject('Could not get EC2 client'));
        });

        test('it throws AwsServiceError', async () => {
          // OPERATE n CHECK
          await expect(() => sshKeyService.createSshKey(createSshKeyRequest)).rejects.toThrow(
            AwsServiceError
          );
        });
      });

      describe('and successfully got EC2 client', () => {
        beforeEach(() => {
          aws.getAwsServiceForRole = jest.fn(() => Promise.resolve(hostSdk));
        });

        describe('but EC2 create call fails', () => {
          beforeEach(() => {
            hostEc2.createKeyPair = jest.fn(() => Promise.reject('Some EC2 thrown error'));
          });

          test('it throws Ec2Error', async () => {
            // OPERATE n CHECK
            await expect(() => sshKeyService.createSshKey(createSshKeyRequest)).rejects.toThrow(Ec2Error);
          });
        });

        describe('and EC2 create call succeeds', () => {
          let mockKeyMaterial: string;
          beforeEach(() => {
            mockKeyMaterial = '--begin private RSA key--...';
            hostEc2.createKeyPair = jest.fn(() =>
              Promise.resolve({ $metadata: {}, KeyMaterial: mockKeyMaterial })
            );
          });

          test('private key and other information is returned', async () => {
            // BUILD
            const expectedResponse = {
              projectId: createSshKeyRequest.projectId,
              privateKey: mockKeyMaterial,
              id: `sshkey-${mockSshKeyId}`,
              owner: createSshKeyRequest.userId
            };

            // OPERATE
            const response = await sshKeyService.createSshKey(createSshKeyRequest);

            // CHECK
            expect(response).toEqual(expectedResponse);
          });
        });
      });
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
