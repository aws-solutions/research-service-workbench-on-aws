/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import {
  CreateProjectRequest,
  DeleteProjectRequest,
  GetProjectRequest,
  GetProjectsRequest,
  ListProjectsRequest,
  Project,
  ProjectService,
  ProjectStatus,
  UpdateProjectRequest
} from '@aws/workbench-core-accounts';
import {
  Action,
  AuthenticatedUser,
  DynamicAuthorizationService,
  Effect,
  IdentityPermission,
  IdentityType
} from '@aws/workbench-core-authorization';
import { SwbAuthZSubject } from '../constants';
import { SWBProjectService } from './swbProjectService';

describe('SWBProjectService', () => {
  let swbProjectService: SWBProjectService;

  let mockWorkbenchProjectService: ProjectService;
  let mockDynamicAuthZService: DynamicAuthorizationService;
  let mockUser: AuthenticatedUser;

  let mockProject: Project;
  let allIdentityPermissions: IdentityPermission[];
  const fakeProjectId: string = 'proj-fake-id';
  const fakeDate: string = '2021-02-26T22:42:16.652Z';

  beforeEach(() => {
    mockWorkbenchProjectService = {} as ProjectService;
    mockDynamicAuthZService = {} as DynamicAuthorizationService;

    mockUser = {
      id: '12345678-1234-1234-1234-123456789012',
      roles: [`${fakeProjectId}#ProjectAdmin`]
    };

    swbProjectService = new SWBProjectService(mockDynamicAuthZService, mockWorkbenchProjectService);

    mockProject = {
      id: fakeProjectId,
      name: 'name1',
      description: '',
      costCenterId: 'cc-1',
      status: ProjectStatus.AVAILABLE,
      createdAt: fakeDate,
      updatedAt: fakeDate,
      awsAccountId: '',
      envMgmtRoleArn: '',
      hostingAccountHandlerRoleArn: '',
      vpcId: '',
      subnetId: '',
      environmentInstanceFiles: '',
      encryptionKeyArn: '',
      externalId: '',
      accountId: ''
    };

    mockDynamicAuthZService.createIdentityPermissions = jest.fn();
    mockDynamicAuthZService.createGroup = jest.fn();
    mockDynamicAuthZService.deleteIdentityPermissions = jest.fn();
    mockDynamicAuthZService.deleteGroup = jest.fn();

    const paIdentityPermissions: IdentityPermission[] = _getPAIdentityPermissions(fakeProjectId);
    const researcherIdentityPermissions: IdentityPermission[] =
      _getResearcherIdentityPermissions(fakeProjectId);

    allIdentityPermissions = [...paIdentityPermissions, ...researcherIdentityPermissions];
  });

  describe('createProject', () => {
    test('create and return project', async () => {
      mockWorkbenchProjectService.createProject = jest.fn().mockReturnValueOnce(mockProject);
      const request: CreateProjectRequest = {
        name: 'name1',
        description: '',
        costCenterId: 'cc-1'
      };

      const project = await swbProjectService.createProject(request, mockUser);

      expect(mockWorkbenchProjectService.createProject).toHaveBeenCalledWith(request);
      expect(mockDynamicAuthZService.createGroup).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        groupId: `${fakeProjectId}#ProjectAdmin`,
        description: `Project Admin group for ${fakeProjectId}`
      });
      expect(mockDynamicAuthZService.createGroup).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        groupId: `${fakeProjectId}#Researcher`,
        description: `Researcher group for ${fakeProjectId}`
      });
      expect(mockDynamicAuthZService.createIdentityPermissions).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        identityPermissions: allIdentityPermissions
      });
      expect(project).toEqual(mockProject);
    });
  });

  describe('deleteProject', () => {
    test('should call projectService and dynamicAuthorizationService', async () => {
      // SETUP
      mockWorkbenchProjectService.softDeleteProject = jest.fn();
      const request: DeleteProjectRequest = {
        projectId: fakeProjectId,
        authenticatedUser: mockUser
      };
      const checkDependencies = async function (): Promise<void> {};

      await swbProjectService.softDeleteProject(request, checkDependencies);

      expect(mockWorkbenchProjectService.softDeleteProject).toHaveBeenCalledWith(request, checkDependencies);
      expect(mockDynamicAuthZService.deleteIdentityPermissions).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        identityPermissions: allIdentityPermissions
      });
      expect(mockDynamicAuthZService.deleteGroup).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        groupId: `${fakeProjectId}#ProjectAdmin`
      });
      expect(mockDynamicAuthZService.deleteGroup).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        groupId: `${fakeProjectId}#Researcher`
      });
    });
  });

  describe('getProject', () => {
    test('should call projectService and return environment', async () => {
      // SETUP
      mockWorkbenchProjectService.getProject = jest.fn().mockReturnValueOnce(mockProject);
      const request: GetProjectRequest = {
        projectId: fakeProjectId
      };

      // OPERATE
      const project = await swbProjectService.getProject(request);

      // VERIFY
      expect(mockWorkbenchProjectService.getProject).toHaveBeenCalledWith(request);
      expect(project).toEqual(mockProject);
    });
  });

  describe('getProjects', () => {
    test('should call projectService and return projects', async () => {
      // SETUP
      mockWorkbenchProjectService.getProjects = jest.fn().mockReturnValueOnce([mockProject]);
      const request: GetProjectsRequest = {
        projectIds: [fakeProjectId]
      };

      // OPERATE
      const projects = await swbProjectService.getProjects(request);

      // VERIFY
      expect(mockWorkbenchProjectService.getProjects).toHaveBeenCalledWith(request);
      expect(projects).toEqual([mockProject]);
    });
  });

  describe('listProjects', () => {
    test('should call projectService and dynamicAuthorizationService, and return list of projects', async () => {
      // SETUP
      mockWorkbenchProjectService.listProjects = jest.fn().mockReturnValueOnce([mockProject]);
      const request: ListProjectsRequest = {
        user: mockUser
      };
      mockDynamicAuthZService.getUserGroups = jest
        .fn()
        .mockReturnValueOnce({ data: { groupIds: mockUser.roles } });

      // OPERATE
      const projects = await swbProjectService.listProjects(request);

      // VERIFY
      expect(mockWorkbenchProjectService.listProjects).toHaveBeenCalledWith(request, mockUser.roles);
      expect(mockDynamicAuthZService.getUserGroups).toHaveBeenCalledWith({
        authenticatedUser: mockUser,
        userId: mockUser.id
      });
      expect(projects).toEqual([mockProject]);
    });
  });

  describe('updateProject', () => {
    test('should call projectService and return project', async () => {
      // SETUP
      mockWorkbenchProjectService.updateProject = jest.fn().mockReturnValueOnce(mockProject);
      const request: UpdateProjectRequest = {
        projectId: fakeProjectId,
        updatedValues: {}
      };

      // OPERATE
      const project = await swbProjectService.updateProject(request);

      // VERIFY
      expect(mockWorkbenchProjectService.updateProject).toHaveBeenCalledWith(request);
      expect(project).toEqual(mockProject);
    });
  });
});

function _getPAIdentityPermissions(projectId: string): IdentityPermission[] {
  const identityPermissions: IdentityPermission[] = [];
  const identityType: IdentityType = 'GROUP';
  const allSubjectId: string = '*';
  const allowEffect: Effect = 'ALLOW';
  const paRole: string = `${projectId}#ProjectAdmin`;

  // Dataset permissions
  for (const action of ['CREATE']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_DATASET,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // List Datasets permission
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_DATASET_LIST,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // Environment permissions
  for (const action of ['CREATE', 'READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // Environment Type permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE
    });
  }
  // Environment Type Config permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_ETC,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // ListProjects permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_PROJECT_LIST
    });
  }
  // Project permissions
  for (const action of ['READ', 'UPDATE', 'DELETE']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: projectId,
      subjectType: SwbAuthZSubject.SWB_PROJECT
    });
  }
  // Project User Association permissions
  for (const action of ['CREATE', 'READ', 'DELETE']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // SSH Key permissions
  for (const action of ['CREATE', 'READ', 'DELETE']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_SSH_KEY,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // User permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: paRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_USER
    });
  }
  return identityPermissions;
}

function _getResearcherIdentityPermissions(projectId: string): IdentityPermission[] {
  const identityPermissions: IdentityPermission[] = [];
  const identityType: IdentityType = 'GROUP';
  const allSubjectId: string = '*';
  const allowEffect: Effect = 'ALLOW';
  const researcherRole: string = `${projectId}#Researcher`;

  // List Dataset permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: researcherRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_DATASET_LIST,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // Environment permissions
  for (const action of ['CREATE', 'READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: researcherRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // Environment Type permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: researcherRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE
    });
  }
  // Environment Type Config permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: researcherRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_ETC,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }
  // ListProjects permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: researcherRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_PROJECT_LIST
    });
  }
  // Project permissions
  for (const action of ['READ']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: researcherRole,
      identityType: identityType,
      subjectId: projectId,
      subjectType: SwbAuthZSubject.SWB_PROJECT
    });
  }
  // SSH Key permissions
  for (const action of ['CREATE', 'READ', 'DELETE']) {
    identityPermissions.push({
      action: action as Action,
      effect: allowEffect,
      identityId: researcherRole,
      identityType: identityType,
      subjectId: allSubjectId,
      subjectType: SwbAuthZSubject.SWB_SSH_KEY,
      conditions: {
        projectId: { $eq: projectId }
      }
    });
  }

  return identityPermissions;
}
