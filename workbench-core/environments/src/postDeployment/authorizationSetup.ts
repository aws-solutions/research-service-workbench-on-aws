/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Action, isGroupAlreadyExistsError } from '@aws/workbench-core-authorization';
import { IdentityPermission } from '@aws/workbench-core-authorization/lib/models/identityPermission';
import { PermissionsService } from '@aws/workbench-core-authorization/lib/models/permissionsService';

export default class AuthorizationSetup {
  private _authService: PermissionsService;

  public constructor(authService: PermissionsService) {
    this._authService = authService;
  }

  public async run(): Promise<void> {
    const groupName = 'ITAdmin';
    await this.createGroupIfNotExist(groupName, 'IT Admin group for SWB.');

    const projectPermissions = this._mapActions(groupName, 'Project', ['User']);
    const environmentTypePermissions = this._mapActions(groupName, 'EnvType', ['EnvTypeConfig']);
    const datasetPermissions = this._mapActions(groupName, 'ExternalDataset');

    const userPermissions = this._mapActions(groupName, 'User');
    const costCenterPermissions = this._mapActions(groupName, 'CostCenter');
    const awsAccountPermissions = this._mapActions(groupName, 'AwsAccount');
    const groupPermissions = this._mapActions(groupName, 'Group | groupId', [], ['UPDATE']);

    await this.createIdentityPermissions([
      ...projectPermissions,
      ...environmentTypePermissions,
      ...datasetPermissions,
      ...userPermissions,
      ...costCenterPermissions,
      ...awsAccountPermissions,
      ...groupPermissions
    ]);
  }

  /**
   * Creates a new group
   * @param groupName - Name of Group to create
   * @param description - Group description
   */
  public async createGroupIfNotExist(groupName: string, description?: string): Promise<void> {
    console.log(`Creating ${groupName} group.`);
    try {
      await this._authService.createGroup({ groupId: groupName, description });
      console.log(`Created ${groupName} group.`);
    } catch (e) {
      if (isGroupAlreadyExistsError(e)) {
        console.log(`${groupName} group already exists`);
      } else {
        throw e;
      }
    }
  }

  /**
   * Creates set of permissions
   * @param permissions - Permissions to create
   */
  public async createIdentityPermissions(permissions: IdentityPermission[]): Promise<void> {
    console.log(`Creating identity permissions.`);
    await this._authService.createIdentityPermissions({
      identityPermissions: permissions
    });
  }

  /**
   * Map list of actions to list of {@link IdentityPermission}
   * @param identityId - group id
   * @param identityId - subject, e.g. Project, CostCenter, etc.
   * @param actions - list of actions allowed for group
   * @returns list of {@link IdentityPermission}
   */
  private _mapActions(
    identityId: string,
    subjectType: string,
    fields: string[] = [],
    actions: Action[] = ['CREATE', 'READ', 'UPDATE', 'DELETE']
  ): IdentityPermission[] {
    return actions.map((action) => {
      return {
        effect: 'ALLOW',
        subjectId: '*',
        identityType: 'GROUP',
        subjectType,
        action,
        identityId,
        fields
      };
    });
  }
}
