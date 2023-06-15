/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const mockSshKeyId = '1234567812345678123456781234567812345678123456781234567812345678';
jest.mock('crypto', () => {
  return {
    createHash: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => mockSshKeyId)
  };
});

import {
  AwsServiceError,
  ConflictError,
  ConnectionInfoNotDefinedError,
  CreateSshKeyRequest,
  DeleteSshKeyRequest,
  Ec2Error,
  ListUserSshKeysForProjectRequest,
  NoInstanceFoundError,
  ListUserSshKeysForProjectResponse,
  NoKeyExistsError,
  NonUniqueKeyError,
  SendPublicKeyRequest
} from '@aws/swb-app';
import { Project, ProjectService } from '@aws/workbench-core-accounts';
import { ProjectStatus } from '@aws/workbench-core-accounts/lib/constants/projectStatus';
import { ForbiddenError } from '@aws/workbench-core-authorization';
import { AwsService } from '@aws/workbench-core-base';
import { Environment, EnvironmentService } from '@aws/workbench-core-environments';
import { DescribeInstancesCommandOutput, EC2, KeyPairInfo } from '@aws-sdk/client-ec2';
import { EC2InstanceConnect, SendSSHPublicKeyCommandOutput } from '@aws-sdk/client-ec2-instance-connect';
import SshKeyService from './sshKeyService';

describe('SshKeyService', () => {
  const region = 'us-east-1';
  const aws = {} as AwsService;
  const projectService = {} as ProjectService;
  const environmentService = {} as EnvironmentService;
  const sshKeyService: SshKeyService = new SshKeyService(aws, projectService, environmentService);
  const validUuid = '1234abcd-1111-abcd-1234-abcd1234abcd';
  const validProjectId = `proj-${validUuid}`;
  const validUserId = validUuid;
  const validEnvId = `env-${validUuid}`;

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
        projectId: validProjectId,
        userId: validUserId
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
        projectId: validProjectId,
        sshKeyId: `sshkey-${mockSshKeyId}`,
        currentUserId: validUserId
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
      createSshKeyRequest = {
        projectId: validProjectId,
        userId: validUserId
      };
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
      sendPublicKeyRequest = {
        projectId: validProjectId,
        environmentId: validEnvId,
        userId: validUserId
      };
    });

    describe('when environment does not exist', () => {
      beforeEach(() => {
        environmentService.getEnvironment = jest.fn(() => {
          throw new Error(`Could not find environment ${sendPublicKeyRequest.environmentId}`);
        });
      });

      test('it throws', async () => {
        // OPERATE n CHECK
        await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
          `Could not find environment ${sendPublicKeyRequest.environmentId}`
        );
      });
    });

    describe('when environment exists', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = {
          id: sendPublicKeyRequest.environmentId,
          instanceId: 'i-123',
          cidr: '',
          description: '',
          name: '',
          projectId: sendPublicKeyRequest.projectId,
          status: 'COMPLETED',
          provisionedProductId: '',
          envTypeConfigId: '',
          updatedAt: '',
          createdAt: '',
          owner: sendPublicKeyRequest.userId
        };
        environmentService.getEnvironment = jest.fn(() => Promise.resolve(environment));
      });

      describe('but projectId does not match requested project id', () => {
        beforeEach(() => {
          environment.projectId = 'proj-incorrect-project-id';
        });

        test('it throws ConflictError', async () => {
          // OPERATE n CHECK
          await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
            ConflictError
          );
        });
      });

      describe('but instanceId is not defined', () => {
        beforeEach(() => {
          environment.instanceId = undefined;
        });

        test('it throws NoInstanceFoundError', async () => {
          // OPERATE n CHECK
          await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
            NoInstanceFoundError
          );
        });
      });

      describe('but status is not COMPLETED', () => {
        beforeEach(() => {
          environment.status = 'ANY STATUS';
        });

        test('it throws ConnectionInfoNotDefinedError', async () => {
          // OPERATE n CHECK
          await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
            ConnectionInfoNotDefinedError
          );
        });
      });

      describe('but project does not exist', () => {
        beforeEach(() => {
          projectService.getProject = jest.fn(() => {
            throw new Error(`Could not find project ${sendPublicKeyRequest.projectId}`);
          });
        });

        test('it throws', async () => {
          // OPERATE n CHECK
          await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
            `Could not find project ${sendPublicKeyRequest.projectId}`
          );
        });
      });

      describe('when project exists', () => {
        const hostSdk = { clients: {} } as AwsService;
        const hostEc2 = {} as EC2;
        let project: Project;

        beforeEach(() => {
          project = {
            id: sendPublicKeyRequest.projectId,
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
            await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
              AwsServiceError
            );
          });
        });

        describe('and successfully got EC2 client', () => {
          beforeEach(() => {
            aws.getAwsServiceForRole = jest.fn(() => Promise.resolve(hostSdk));
          });

          describe('but get ssh key EC2 call fails', () => {
            beforeEach(() => {
              hostEc2.describeKeyPairs = jest.fn(() => Promise.reject('Some EC2 thrown error'));
            });

            test('it throws Ec2Error', async () => {
              // OPERATE n CHECK
              await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(Ec2Error);
            });
          });

          describe('and get ssh key EC2 call succeeds', () => {
            beforeEach(() => {
              const keyPairs = [
                {
                  PublicKey: 'ssh-rsa AAAA...SAMPLEKEY',
                  Tags: [{ Key: 'user', Value: `${sendPublicKeyRequest.userId}` }]
                }
              ];
              hostEc2.describeKeyPairs = jest.fn(() =>
                Promise.resolve({ $metadata: {}, KeyPairs: keyPairs })
              );
            });

            describe('but no key exists', () => {
              beforeEach(() => {
                hostEc2.describeKeyPairs = jest.fn(() => Promise.resolve({ $metadata: {}, KeyPairs: [] }));
              });

              test('it throws NoKeyExistsError', async () => {
                // OPERATE n CHECK
                await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                  NoKeyExistsError
                );
              });
            });

            describe('but multiple keys exists', () => {
              beforeEach(() => {
                const keyPairs = [
                  { Tags: [{ Key: 'user', Value: `${sendPublicKeyRequest.userId}` }] },
                  { Tags: [{ Key: 'user', Value: `${sendPublicKeyRequest.userId}` }] }
                ];
                hostEc2.describeKeyPairs = jest.fn(() =>
                  Promise.resolve({ $metadata: {}, KeyPairs: keyPairs })
                );
              });

              test('it throws NonUniqueKeyError', async () => {
                // OPERATE n CHECK
                await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                  NonUniqueKeyError
                );
              });
            });

            describe('and successfully got EC2 instance connect client', () => {
              const hostEc2InstanceConnect = {} as EC2InstanceConnect;

              beforeEach(() => {
                hostSdk.clients.ec2InstanceConnect = hostEc2InstanceConnect;
              });

              describe('but get instances EC2 call fails', () => {
                beforeEach(() => {
                  hostEc2.describeInstances = jest.fn(() => Promise.reject('Some EC2 thrown error'));
                });

                test('it throws Ec2Error', async () => {
                  // OPERATE n CHECK
                  await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                    Ec2Error
                  );
                });
              });

              describe('and get instances EC2 call succeeds', () => {
                let describeInstancesResponse: DescribeInstancesCommandOutput;
                let examplePublicDnsName: string;
                let examplePublicIpAddress: string;
                let examplePrivateDnsName: string;
                let examplePrivateIpAddress: string;

                beforeEach(() => {
                  examplePublicDnsName = 'publicdnsname.example';
                  examplePublicIpAddress = '3.1.4.1';
                  examplePrivateDnsName = 'privatednsname.example';
                  examplePrivateIpAddress = '5.9.2.6';
                  describeInstancesResponse = {
                    $metadata: {},
                    Reservations: [
                      {
                        Instances: [
                          {
                            PublicDnsName: examplePublicDnsName,
                            PublicIpAddress: examplePublicIpAddress,
                            PrivateDnsName: examplePrivateDnsName,
                            PrivateIpAddress: examplePrivateIpAddress
                          }
                        ]
                      }
                    ]
                  };
                  hostEc2.describeInstances = jest.fn(() => Promise.resolve(describeInstancesResponse));
                });

                describe('but send ssh public key EC2 call fails', () => {
                  beforeEach(() => {
                    hostEc2InstanceConnect.sendSSHPublicKey = jest.fn(() =>
                      Promise.reject('Some EC2 thrown error')
                    );
                  });

                  test('it throws Ec2Error', async () => {
                    // OPERATE n CHECK
                    await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                      Ec2Error
                    );
                  });
                });

                describe('and send ssh public key EC2 call succeeds', () => {
                  let sendSshPublicKeyResponse: SendSSHPublicKeyCommandOutput;

                  beforeEach(() => {
                    sendSshPublicKeyResponse = { $metadata: {}, Success: true };
                    hostEc2InstanceConnect.sendSSHPublicKey = jest.fn(() =>
                      Promise.resolve(sendSshPublicKeyResponse)
                    );
                  });

                  describe('but success = false', () => {
                    beforeEach(() => {
                      sendSshPublicKeyResponse.Success = false;
                    });

                    test('it throws Ec2Error', async () => {
                      // OPERATE n CHECK
                      await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                        Ec2Error
                      );
                    });
                  });

                  describe('but no reservation info was returned', () => {
                    beforeEach(() => {
                      describeInstancesResponse = { $metadata: {}, Reservations: [] };
                    });

                    test('it throws NoInstanceFoundError', async () => {
                      // OPERATE n CHECK
                      await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                        NoInstanceFoundError
                      );
                    });
                  });

                  describe('but Reservations is undefined', () => {
                    beforeEach(() => {
                      describeInstancesResponse = { $metadata: {} };
                    });

                    test('it throws NoInstanceFoundError', async () => {
                      // OPERATE n CHECK
                      await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                        NoInstanceFoundError
                      );
                    });
                  });

                  describe('but Instances is undefined', () => {
                    beforeEach(() => {
                      describeInstancesResponse = { $metadata: {}, Reservations: [{}] };
                    });

                    test('it throws NoInstanceFoundError', async () => {
                      // OPERATE n CHECK
                      await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                        NoInstanceFoundError
                      );
                    });
                  });

                  describe('but no instance info was returned', () => {
                    beforeEach(() => {
                      describeInstancesResponse = { $metadata: {}, Reservations: [{ Instances: [] }] };
                    });

                    test('it throws NoInstanceFoundError', async () => {
                      // OPERATE n CHECK
                      await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                        NoInstanceFoundError
                      );
                    });
                  });

                  describe('but no connection info was returned', () => {
                    beforeEach(() => {
                      describeInstancesResponse = { $metadata: {}, Reservations: [{ Instances: [{}] }] };
                    });

                    test('it throws ConnectionInfoNotDefinedError', async () => {
                      // OPERATE n CHECK
                      await expect(() => sshKeyService.sendPublicKey(sendPublicKeyRequest)).rejects.toThrow(
                        ConnectionInfoNotDefinedError
                      );
                    });
                  });

                  describe('and connection info was returned', () => {
                    test('it returns the connection info', async () => {
                      // BUILD
                      const expected = {
                        publicDnsName: examplePublicDnsName,
                        publicIp: examplePublicIpAddress,
                        privateDnsName: examplePrivateDnsName,
                        privateIp: examplePrivateIpAddress
                      };
                      // OPERATE
                      const actual = await sshKeyService.sendPublicKey(sendPublicKeyRequest);

                      // CHECK
                      expect(actual).toEqual(expected);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
