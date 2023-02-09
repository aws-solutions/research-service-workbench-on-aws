/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { ProjectService } from '@aws/workbench-core-accounts';
import { ProjectStatus } from '@aws/workbench-core-accounts/lib/constants/projectStatus';
import { Project } from '@aws/workbench-core-accounts/lib/models/projects/project';
import {
  Action,
  AuthenticatedUser,
  DynamicAuthorizationService,
  Effect,
  IdentityPermission,
  IdentityType
} from '@aws/workbench-core-authorization';
import { Environment, EnvironmentService } from '@aws/workbench-core-environments';
import { SwbAuthZSubject } from '../constants';
import { ProjectEnvService } from './projectEnvService';

describe('ProjectEnvService', () => {
  let projectEnvService: ProjectEnvService;

  let mockWorkbenchEnvironmentService: EnvironmentService;
  let mockWorkbenchProjectService: ProjectService;
  let mockDynamicAuthZService: DynamicAuthorizationService;
  let mockUser: AuthenticatedUser;

  const fakeEnvId: string = 'env-fake-id';
  let mockEnv: Environment;
  const fakeProjectId: string = 'proj-fake-id';
  const fakeDate: string = '2021-02-26T22:42:16.652Z';

  beforeEach(() => {
    mockWorkbenchEnvironmentService = {} as EnvironmentService;
    mockWorkbenchProjectService = {} as ProjectService;
    mockDynamicAuthZService = {} as DynamicAuthorizationService;

    mockUser = {
      id: 'user-123',
      roles: []
    };

    projectEnvService = new ProjectEnvService(
      mockDynamicAuthZService,
      mockWorkbenchEnvironmentService,
      mockWorkbenchProjectService
    );

    mockEnv = {
      id: fakeEnvId,
      cidr: '0.0.0.0/0',
      createdAt: '2022-05-13T20:03:54.055Z',
      updatedBy: 'user-123',
      createdBy: 'user-123',
      description: 'test 123',
      envTypeConfigId: 'envTypeConfig-123',
      error: undefined,
      name: 'testEnv',
      outputs: [],
      owner: 'user-123',
      projectId: fakeProjectId,
      status: 'PENDING',
      type: 'ETC#etc-123',
      updatedAt: '2022-05-13T20:03:54.055Z',
      instanceId: 'instance-123',
      provisionedProductId: '',
      dependency: fakeProjectId
    };

    const mockProject: Project = {
      id: fakeProjectId,
      name: 'fakeProjectName',
      description: 'fakeProjectDescription',
      costCenterId: 'cc-123',
      status: ProjectStatus.AVAILABLE,
      createdAt: fakeDate,
      updatedAt: fakeDate,
      awsAccountId: 'awsacc-123',
      envMgmtRoleArn: 'fakeEnvMgmtRoleArn',
      hostingAccountHandlerRoleArn: 'fakeHostingAccountHandlerRoleArn',
      vpcId: 'vpc-123',
      subnetId: 'subnet-123',
      environmentInstanceFiles: '',
      encryptionKeyArn: 'fakeEncryptionKeyArn',
      externalId: 'workbench',
      accountId: 'acc-123'
    };
    mockWorkbenchProjectService.getProject = jest.fn().mockReturnValue(mockProject);

    mockDynamicAuthZService.createIdentityPermissions = jest.fn();
  });

  describe('createEnvironment', () => {
    const envIdentityPermissions: IdentityPermission[] = [];
    const envConnectionIdentityPermissions: IdentityPermission[] = [];
    const identityIds: string[] = [`${fakeProjectId}#ProjectAdmin`, `${fakeProjectId}#Researcher`];
    const identityType: IdentityType = 'GROUP';
    const subjectId: string = fakeEnvId;
    const envSubjectType: string = SwbAuthZSubject.SWB_ENVIRONMENT;
    const envConnectionSubjectType: string = SwbAuthZSubject.SWB_ENVIRONMENT_CONNECTION;
    const allowEffect: Effect = 'ALLOW';
    const actions: Action[] = ['READ', 'UPDATE', 'DELETE'];

    for (const identityId of identityIds) {
      envConnectionIdentityPermissions.push({
        action: 'READ',
        effect: allowEffect,
        identityId: identityId,
        identityType: identityType,
        subjectId: subjectId,
        subjectType: envConnectionSubjectType
      });
      for (const action of actions) {
        envIdentityPermissions.push({
          action: action,
          effect: allowEffect,
          identityId: identityId,
          identityType: identityType,
          subjectId: subjectId,
          subjectType: envSubjectType
        });
      }
    }

    const createEnvReq = {
      instanceId: 'inid-123',
      cidr: '0.0.0.0/0',
      description: 'test 123',
      name: 'testEnv',
      outputs: [],
      envTypeId: 'et-123',
      envTypeConfigId: 'etc-123',
      projectId: fakeProjectId,
      datasetIds: ['dataset-123'],
      status: 'PENDING'
    };

    test('create and return environment', async () => {
      mockWorkbenchEnvironmentService.createEnvironment = jest.fn().mockReturnValueOnce(mockEnv);

      const env = await projectEnvService.createEnvironment(createEnvReq, mockUser);

      expect(mockWorkbenchProjectService.getProject).toHaveBeenCalledWith({ projectId: fakeProjectId });
      expect(mockDynamicAuthZService.createIdentityPermissions).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        identityPermissions: envIdentityPermissions
      });
      expect(mockDynamicAuthZService.createIdentityPermissions).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        identityPermissions: envConnectionIdentityPermissions
      });
      expect(env).toEqual(mockEnv);
    });
  });

  describe('getEnvironment', () => {
    test('should call projectService and environmentService, and return environment', async () => {
      mockWorkbenchEnvironmentService.getEnvironment = jest.fn().mockReturnValueOnce(mockEnv);

      const env = await projectEnvService.getEnvironment(fakeProjectId, fakeEnvId);

      expect(mockWorkbenchProjectService.getProject).toHaveBeenCalledWith({ projectId: fakeProjectId });
      expect(mockWorkbenchEnvironmentService.getEnvironment).toHaveBeenCalledWith(fakeEnvId, false);
      expect(env).toEqual(mockEnv);
    });
  });

  describe('listProjectEnvs', () => {
    test('should call projectService and environmentService, and return list of environments', async () => {
      mockWorkbenchEnvironmentService.listEnvironments = jest.fn().mockReturnValueOnce([mockEnv]);

      const envs = await projectEnvService.listProjectEnvs(fakeProjectId, mockUser);

      expect(mockWorkbenchProjectService.getProject).toHaveBeenCalledWith({ projectId: fakeProjectId });
      expect(mockWorkbenchEnvironmentService.listEnvironments).toHaveBeenLastCalledWith(
        mockUser,
        { project: fakeProjectId },
        undefined,
        undefined
      );
      expect(envs).toEqual([mockEnv]);
    });
  });

  describe('updateEnvironment', () => {
    test('should call projectService and environmentService, and return environment', async () => {
      mockWorkbenchEnvironmentService.updateEnvironment = jest.fn().mockReturnValueOnce(mockEnv);

      const env = await projectEnvService.updateEnvironment(fakeProjectId, fakeEnvId, {});

      expect(mockWorkbenchProjectService.getProject).toHaveBeenCalledWith({ projectId: fakeProjectId });
      expect(mockWorkbenchEnvironmentService.updateEnvironment).toHaveBeenCalledWith(fakeEnvId, {});
      expect(env).toEqual(mockEnv);
    });
  });
});
