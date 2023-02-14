/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  EnvTypeConfigPlugin,
  GetEnvironmentTypeConfigRequest,
  ListEnvironmentTypeConfigsRequest,
  CreateEnvironmentTypeConfigRequest,
  UpdateEnvironmentTypeConfigRequest,
  DeleteEnvironmentTypeConfigRequest,
  EnvironmentTypeConfig,
  ConflictError
} from '@aws/swb-app';
import {
  MetadataService,
  RelationshipDDBItem,
  RelationshipDDBItemParser,
  resourceTypeToKey
} from '@aws/workbench-core-base';

import { EnvironmentTypeConfigService } from '@aws/workbench-core-environments';

export class EnvTypeConfigService implements EnvTypeConfigPlugin {
  private _envTypeConfigService: EnvironmentTypeConfigService;
  private _metadataService: MetadataService;

  public constructor(envTypeConfigService: EnvironmentTypeConfigService, metadataService: MetadataService) {
    this._envTypeConfigService = envTypeConfigService;
    this._metadataService = metadataService;
  }

  public async getEnvTypeConfig(request: GetEnvironmentTypeConfigRequest): Promise<EnvironmentTypeConfig> {
    return await this._envTypeConfigService.getEnvironmentTypeConfig(
      request.envTypeId,
      request.envTypeConfigId
    );
  }

  public async listEnvTypeConfigs(
    request: ListEnvironmentTypeConfigsRequest
  ): Promise<{ data: EnvironmentTypeConfig[]; paginationToken: string | undefined }> {
    return await this._envTypeConfigService.listEnvironmentTypeConfigs(request);
  }

  public async createEnvTypeConfig(
    request: CreateEnvironmentTypeConfigRequest
  ): Promise<EnvironmentTypeConfig> {
    return await this._envTypeConfigService.createNewEnvironmentTypeConfig(request);
  }

  public async updateEnvTypeConfig(
    request: UpdateEnvironmentTypeConfigRequest
  ): Promise<EnvironmentTypeConfig> {
    return await this._envTypeConfigService.updateEnvironmentTypeConfig(request);
  }

  public async deleteEnvTypeConfig(request: DeleteEnvironmentTypeConfigRequest): Promise<void> {
    await this._validateAssociations(request.envTypeId, request.envTypeConfigId);
    return await this._envTypeConfigService.softDeleteEnvironmentTypeConfig(request);
  }

  private async _validateAssociations(envTypeId: string, envTypeConfigId: string): Promise<void> {
    const composedType = `${resourceTypeToKey.envType}#${envTypeId}${resourceTypeToKey.envTypeConfig}`;
    const relationshipIds = await this._metadataService.listDependentMetadata<RelationshipDDBItem>(
      composedType,
      envTypeConfigId,
      resourceTypeToKey.project,
      RelationshipDDBItemParser
    );
    if (relationshipIds?.data?.length) {
      throw new ConflictError(
        `There are projects associated with Workspace configuration. Please dissasociate projects from configuration before deleting.`
      );
    }
  }
}
