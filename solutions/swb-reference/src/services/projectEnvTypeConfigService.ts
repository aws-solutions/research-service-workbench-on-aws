/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  ProjectEnvTypeConfigPlugin,
  ListProjectEnvTypeConfigsRequest,
  AssociateProjectEnvTypeConfigRequest,
  DisassociateProjectEnvTypeConfigRequest,
  ConflictError,
  GetProjectEnvTypeConfigRequest,
  ListEnvTypeConfigProjectsRequest,
  Project,
  ProjectDeletedError,
  EnvironmentItem
} from '@aws/swb-app';
import { ProjectService, ProjectStatus } from '@aws/workbench-core-accounts';
import {
  AuthenticatedUser,
  CreateIdentityPermissionsRequestParser,
  DeleteIdentityPermissionsRequestParser,
  DynamicAuthorizationService,
  IdentityPermission
} from '@aws/workbench-core-authorization';
import {
  MetadataService,
  resourceTypeToKey,
  RelationshipDDBItem,
  RelationshipDDBItemParser,
  PaginatedResponse
} from '@aws/workbench-core-base';
import {
  EnvironmentTypeConfigService,
  EnvironmentTypeService,
  EnvironmentTypeConfig,
  EnvironmentService
} from '@aws/workbench-core-environments';
import { SwbAuthZSubject } from '../constants';
import { getProjectAdminRole, getResearcherRole } from '../utils/roleUtils';

export class ProjectEnvTypeConfigService implements ProjectEnvTypeConfigPlugin {
  private _metadataService: MetadataService;
  private _projectService: ProjectService;
  private _environmentService: EnvironmentService;
  private _envTypeConfigService: EnvironmentTypeConfigService;
  private _envTypeService: EnvironmentTypeService;
  private _dynamicAuthService: DynamicAuthorizationService;
  private _identityPermissionTemplate: IdentityPermission = {
    action: 'READ',
    effect: 'ALLOW',
    identityId: '',
    identityType: 'GROUP',
    subjectId: '',
    subjectType: SwbAuthZSubject.SWB_ETC
  };
  public constructor(
    metadataService: MetadataService,
    projectService: ProjectService,
    envTypeConfigService: EnvironmentTypeConfigService,
    envTypeService: EnvironmentTypeService,
    environmentService: EnvironmentService,
    dynamicAuthService: DynamicAuthorizationService
  ) {
    this._metadataService = metadataService;
    this._projectService = projectService;
    this._envTypeConfigService = envTypeConfigService;
    this._envTypeService = envTypeService;
    this._environmentService = environmentService;
    this._dynamicAuthService = dynamicAuthService;
  }

  public async associateProjectWithEnvTypeConfig(
    request: AssociateProjectEnvTypeConfigRequest
  ): Promise<void> {
    const { projectId, envTypeId, envTypeConfigId, user } = request;
    const project = await this._projectService.getProject({ projectId });

    if (project.status === ProjectStatus.DELETED) {
      throw new ProjectDeletedError(`Project was deleted`);
    }

    await this._envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);
    const composedId = `${envTypeId}${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`;
    await this._metadataService.updateRelationship(
      resourceTypeToKey.project,
      { id: projectId },
      resourceTypeToKey.envType,
      [{ id: composedId, data: { id: envTypeConfigId } }]
    );
    await this._addAuthZPermissionsForETC(user, projectId, envTypeConfigId);
  }

  public async disassociateProjectAndEnvTypeConfig(
    request: DisassociateProjectEnvTypeConfigRequest
  ): Promise<void> {
    const { projectId, envTypeId, envTypeConfigId, user } = request;
    await this._projectService.getProject({ projectId });
    await this._envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);
    const composedId = `${envTypeId}${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`;
    await this._validateActiveEnvironments(projectId, envTypeId, envTypeConfigId, user);
    await this._removeAuthZPermissionsForETC(user, projectId, envTypeConfigId);
    await this._metadataService.deleteRelationships(
      resourceTypeToKey.project,
      projectId,
      resourceTypeToKey.envType,
      [composedId]
    );
  }

  public async listProjectEnvTypeConfigs(
    request: ListProjectEnvTypeConfigsRequest
  ): Promise<{ data: EnvironmentTypeConfig[]; paginationToken: string | undefined }> {
    const { projectId, envTypeId, ...pagionationParams } = request;
    await this._projectService.getProject({ projectId });
    await this._envTypeService.getEnvironmentType(envTypeId);
    const composedType = `${resourceTypeToKey.envType}#${envTypeId}${resourceTypeToKey.envTypeConfig}`;
    const relationshipIds = await this._metadataService.listDependentMetadata<RelationshipDDBItem>(
      resourceTypeToKey.project,
      projectId,
      composedType,
      RelationshipDDBItemParser,
      pagionationParams
    );
    const envTypeConfigs =
      relationshipIds?.data?.length > 0
        ? await this._envTypeConfigService.getEnvironmentTypeConfigs(relationshipIds.data.map((r) => r.id))
        : [];
    return {
      data: envTypeConfigs,
      paginationToken: relationshipIds.paginationToken
    };
  }

  public async listEnvTypeConfigProjects(
    request: ListEnvTypeConfigProjectsRequest
  ): Promise<{ data: Project[]; paginationToken: string | undefined }> {
    const { envTypeId, envTypeConfigId, ...pagionationParams } = request;
    await this._envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);
    const composedType = `${resourceTypeToKey.envType}#${envTypeId}${resourceTypeToKey.envTypeConfig}`;
    const relationshipIds = await this._metadataService.listDependentMetadata<RelationshipDDBItem>(
      composedType,
      envTypeConfigId,
      resourceTypeToKey.project,
      RelationshipDDBItemParser,
      pagionationParams
    );
    const projects =
      relationshipIds?.data?.length > 0
        ? await this._projectService.getProjects({ projectIds: relationshipIds.data.map((r) => r.id) })
        : [];
    return {
      data: projects,
      paginationToken: relationshipIds.paginationToken
    };
  }

  public async getEnvTypeConfig(
    request: GetProjectEnvTypeConfigRequest
  ): Promise<EnvironmentTypeConfig | undefined> {
    const { projectId, envTypeId, envTypeConfigId } = request;
    const composedType = `${resourceTypeToKey.envType}#${envTypeId}${resourceTypeToKey.envTypeConfig}`;
    const relationshipItem = await this._metadataService.getMetadataItem<RelationshipDDBItem>(
      resourceTypeToKey.project,
      projectId,
      composedType,
      envTypeConfigId,
      RelationshipDDBItemParser
    );

    if (!relationshipItem) {
      return undefined;
    }

    return await this._envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);
  }

  private async _addAuthZPermissionsForETC(
    authenticatedUser: AuthenticatedUser,
    projectId: string,
    envTypeConfigId: string
  ): Promise<void> {
    const identityPermissions: IdentityPermission[] = [];
    const adminIdentity = {
      ...this._identityPermissionTemplate,
      identityId: getProjectAdminRole(projectId),
      subjectId: envTypeConfigId
    };
    const researcherIdentity = {
      ...this._identityPermissionTemplate,
      identityId: getResearcherRole(projectId),
      subjectId: envTypeConfigId
    };
    identityPermissions.push(adminIdentity);
    identityPermissions.push(researcherIdentity);

    const existingIdentities = await this._dynamicAuthService.getIdentityPermissionsBySubject({
      action: 'READ',
      identities: [
        { identityType: adminIdentity.identityType, identityId: adminIdentity.identityId },
        { identityType: researcherIdentity.identityType, identityId: researcherIdentity.identityId }
      ],
      subjectType: adminIdentity.subjectType,
      subjectId: adminIdentity.subjectId
    });

    if (existingIdentities?.data?.identityPermissions?.length > 0)
      //identity already exists
      return Promise.resolve();

    const createRequest = CreateIdentityPermissionsRequestParser.parse({
      authenticatedUser,
      identityPermissions
    });

    await this._dynamicAuthService.createIdentityPermissions(createRequest);
  }

  private async _removeAuthZPermissionsForETC(
    authenticatedUser: AuthenticatedUser,
    projectId: string,
    envTypeConfigId: string
  ): Promise<void> {
    const identityPermissions: IdentityPermission[] = [];
    identityPermissions.push({
      ...this._identityPermissionTemplate,
      identityId: getProjectAdminRole(projectId),
      subjectId: envTypeConfigId
    });
    identityPermissions.push({
      ...this._identityPermissionTemplate,
      identityId: getResearcherRole(projectId),
      subjectId: envTypeConfigId
    });
    const deleteRequest = DeleteIdentityPermissionsRequestParser.parse({
      authenticatedUser,
      identityPermissions
    });

    await this._dynamicAuthService.deleteIdentityPermissions(deleteRequest);
  }

  private async _validateActiveEnvironments(
    projectId: string,
    envTypeId: string,
    envTypeConfigId: string,
    user: AuthenticatedUser
  ): Promise<void> {
    const typeId = `${resourceTypeToKey.envType}#${envTypeId}${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`;
    let paginationToken: string | undefined = undefined;

    do {
      const dependencies: PaginatedResponse<EnvironmentItem> =
        await this._environmentService.listEnvironments({
          filter: { type: { eq: typeId } },
          pageSize: 200,
          paginationToken
        });
      if (dependencies?.data) {
        const activeEnvironments = dependencies.data.filter(
          (e) => e.status !== 'FAILED' && e.projectId === projectId
        );
        if (activeEnvironments.length > 0) {
          throw new ConflictError(
            `There are active environments using this configuration. Please Terminate environments or wait until environments are in 'TERMINATED' status before trying to disassociate configuration.`
          );
        }
        paginationToken = dependencies.paginationToken;
      }
    } while (paginationToken !== undefined);
  }
}
