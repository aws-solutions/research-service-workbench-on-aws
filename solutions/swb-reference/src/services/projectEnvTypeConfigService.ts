/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectEnvTypeConfigPlugin, ListProjectEnvTypeConfigsRequest } from '@aws/swb-app';
import { ProjectService } from '@aws/workbench-core-accounts';
import {
  MetadataService,
  resourceTypeToKey,
  RelationshipDDBItem,
  RelationshipDDBItemParser
} from '@aws/workbench-core-base';
import {
  EnvironmentTypeConfigService,
  EnvironmentTypeService,
  EnvironmentTypeConfig
} from '@aws/workbench-core-environments';

export class ProjectEnvTypeConfigService implements ProjectEnvTypeConfigPlugin {
  private _metadataService: MetadataService;
  private _projectService: ProjectService;
  private _envTypeConfigService: EnvironmentTypeConfigService;
  private _envTypeService: EnvironmentTypeService;
  public constructor(
    metadataService: MetadataService,
    projectService: ProjectService,
    envTypeConfigService: EnvironmentTypeConfigService,
    envTypeService: EnvironmentTypeService
  ) {
    this._metadataService = metadataService;
    this._projectService = projectService;
    this._envTypeConfigService = envTypeConfigService;
    this._envTypeService = envTypeService;
  }

  public async associateProjectWithEnvTypeConfig(
    projectId: string,
    envTypeId: string,
    envTypeConfigId: string
  ): Promise<void> {
    await this._projectService.getProject({ projectId });
    await this._envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);
    const composedId = `${envTypeId}${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`;
    await this._metadataService.updateRelationship(
      resourceTypeToKey.project,
      { id: projectId },
      resourceTypeToKey.envType,
      [{ id: composedId, data: { id: envTypeConfigId } }]
    );
  }

  public async disassociateProjectAndEnvTypeConfig(
    projectId: string,
    envTypeId: string,
    envTypeConfigId: string
  ): Promise<void> {
    await this._projectService.getProject({ projectId });
    await this._envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);
    const composedId = `${envTypeId}${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`;
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
      request.projectId,
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
}
