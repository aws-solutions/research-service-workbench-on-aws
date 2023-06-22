/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { ConflictError, ProjectDeletedError } from '@aws/swb-app';
import { ProjectService, ProjectStatus } from '@aws/workbench-core-accounts';
import { DynamicAuthorizationService } from '@aws/workbench-core-authorization';
import { MetadataService } from '@aws/workbench-core-base';
import {
  EnvironmentService,
  EnvironmentTypeConfigService,
  EnvironmentTypeService
} from '@aws/workbench-core-environments';
import { ProjectEnvTypeConfigService } from './projectEnvTypeConfigService';

describe('projectEnvTypeConfigService', () => {
  let mockDynamicAuthService: DynamicAuthorizationService;
  let mockEnvironmentService: EnvironmentService;
  let mockEnvironmentTypeService: EnvironmentTypeService;
  let mockEnvironmentTypeConfigService: EnvironmentTypeConfigService;
  let mockMetadataService: MetadataService;
  let mockProjectService: ProjectService;
  let projectEnvTypeConfigPlugin: ProjectEnvTypeConfigService;
  const projectId = 'proj-id';
  const envTypeId = 'et-id';
  const envTypeConfigId = 'etc-id';
  const user = { roles: ['ITAdmin'], id: '12345678-1234-1234-1234-123456789012' };
  const disassociateRequest = { projectId, envTypeId, envTypeConfigId, user };
  const associateRequest = { projectId, envTypeId, envTypeConfigId, user };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDynamicAuthService = {} as DynamicAuthorizationService;
    mockEnvironmentService = {} as EnvironmentService;
    mockEnvironmentTypeService = {} as EnvironmentTypeService;
    mockEnvironmentTypeConfigService = {} as EnvironmentTypeConfigService;
    mockMetadataService = {} as MetadataService;
    mockProjectService = {} as ProjectService;
    projectEnvTypeConfigPlugin = new ProjectEnvTypeConfigService(
      mockMetadataService,
      mockProjectService,
      mockEnvironmentTypeConfigService,
      mockEnvironmentTypeService,
      mockEnvironmentService,
      mockDynamicAuthService
    );
  });

  describe('disassociateProjectAndEnvTypeConfig', () => {
    beforeEach(() => {
      mockProjectService.getProject = jest.fn().mockReturnValue({});
      mockEnvironmentTypeConfigService.getEnvironmentTypeConfig = jest.fn().mockReturnValue({});
      mockEnvironmentService.listEnvironments = jest.fn().mockReturnValue({ data: [] });
      mockDynamicAuthService.deleteIdentityPermissions = jest.fn().mockReturnValue({});
      mockMetadataService.deleteRelationships = jest.fn().mockReturnValue({});
    });
    test('executes successfully when there are no conflicting environments', async () => {
      // OPERATE n CHECK
      await expect(() => projectEnvTypeConfigPlugin.disassociateProjectAndEnvTypeConfig(disassociateRequest))
        .resolves;
    });
    test('throws Conflict Error when environment is using env type config', async () => {
      mockEnvironmentService.listEnvironments = jest
        .fn()
        .mockReturnValueOnce({ data: [{ id: 'activeEnv', status: 'PENDING', projectId: projectId }] });
      // OPERATE n CHECK
      await expect(() =>
        projectEnvTypeConfigPlugin.disassociateProjectAndEnvTypeConfig(disassociateRequest)
      ).rejects.toThrow(ConflictError);
    });
    test('executes successfully when there is only failed environments using configuration ', async () => {
      mockEnvironmentService.listEnvironments = jest
        .fn()
        .mockReturnValue({ data: [{ id: 'activeEnv', status: 'FAILED', projectId: projectId }] });
      // OPERATE n CHECK
      await expect(() => projectEnvTypeConfigPlugin.disassociateProjectAndEnvTypeConfig(disassociateRequest))
        .resolves;
    });
    test('executes successfully and removes identity permissions', async () => {
      // OPERATE n CHECK
      await projectEnvTypeConfigPlugin.disassociateProjectAndEnvTypeConfig(disassociateRequest);
      expect(mockDynamicAuthService.deleteIdentityPermissions).toHaveBeenCalledTimes(1);
    });
  });

  describe('associateProjectAndEnvTypeConfig', () => {
    beforeEach(() => {
      mockProjectService.getProject = jest.fn().mockReturnValue({
        status: ProjectStatus.AVAILABLE
      });
      mockEnvironmentTypeConfigService.getEnvironmentTypeConfig = jest.fn().mockReturnValue({});
      mockMetadataService.updateRelationship = jest.fn().mockReturnValue({});
      mockDynamicAuthService.createIdentityPermissions = jest.fn().mockReturnValue({});
      mockDynamicAuthService.getIdentityPermissionsBySubject = jest.fn().mockReturnValue({});
    });
    test('executes successfully', async () => {
      // OPERATE n CHECK
      await expect(() => projectEnvTypeConfigPlugin.associateProjectWithEnvTypeConfig(associateRequest))
        .resolves;
    });
    test('executes successfully and adds identity permissions', async () => {
      // OPERATE n CHECK
      await projectEnvTypeConfigPlugin.associateProjectWithEnvTypeConfig(associateRequest);
      expect(mockDynamicAuthService.createIdentityPermissions).toHaveBeenCalledTimes(1);
    });
    test('executes successfully and when association already exists', async () => {
      mockDynamicAuthService.getIdentityPermissionsBySubject = jest
        .fn()
        .mockReturnValue({ data: { identityPermissions: [{ id: 'mockObject' }] } });
      // OPERATE n CHECK
      await expect(
        projectEnvTypeConfigPlugin.associateProjectWithEnvTypeConfig(associateRequest)
      ).resolves.not.toThrow();
    });
    test('fails when project was deleted', async () => {
      mockProjectService.getProject = jest.fn().mockReturnValue({
        status: ProjectStatus.DELETED
      });

      // OPERATE n CHECK
      await expect(() =>
        projectEnvTypeConfigPlugin.associateProjectWithEnvTypeConfig(associateRequest)
      ).rejects.toThrowError(ProjectDeletedError);
    });
  });
});
