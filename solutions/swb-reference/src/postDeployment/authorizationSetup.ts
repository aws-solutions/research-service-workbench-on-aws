/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  Action,
  DynamicAuthorizationService,
  isGroupAlreadyExistsError,
  IdentityPermission,
  AuthenticatedUser,
  isIdentityPermissionCreationError
} from '@aws/workbench-core-authorization';
import { SwbAuthZSubject } from '../constants';

export default class AuthorizationSetup {
  private _authService: DynamicAuthorizationService;
  private _constants: {
    ROOT_USER_EMAIL: string;
  };

  public constructor(authService: DynamicAuthorizationService, constants: { ROOT_USER_EMAIL: string }) {
    this._authService = authService;
    this._constants = constants;
  }

  public async run(): Promise<void> {
    const itAdmin = 'ITAdmin';
    const adminUser: AuthenticatedUser = { id: this._constants.ROOT_USER_EMAIL, roles: [itAdmin] };

    await this.createGroupIfNotExist(itAdmin, 'IT Admin group for SWB.', adminUser);

    //IT Admin Permissions
    const projectPermissions = this._mapActions(itAdmin, SwbAuthZSubject.SWB_PROJECT);
    const userPermissions = this._mapActions(itAdmin, SwbAuthZSubject.SWB_USER);
    const environmentTypePermissions = this._mapActions(itAdmin, SwbAuthZSubject.SWB_ENVIRONMENT_TYPE);
    const environmentTypeConfigPermissions = this._mapActions(itAdmin, SwbAuthZSubject.SWB_ETC);
    const datasetPermissions = this._mapActions(itAdmin, SwbAuthZSubject.SWB_DATASET);
    const costCenterPermissions = this._mapActions(itAdmin, SwbAuthZSubject.SWB_COST_CENTER);
    const awsAccountPermissions = this._mapActions(itAdmin, SwbAuthZSubject.SWB_AWS_ACCOUNT);

    await this.createIdentityPermissions(
      [
        ...projectPermissions,
        ...environmentTypePermissions,
        ...environmentTypeConfigPermissions,
        ...datasetPermissions,
        ...userPermissions,
        ...costCenterPermissions,
        ...awsAccountPermissions
      ],
      adminUser
    );

    await this.assignUserToGroup(adminUser.id, itAdmin, adminUser);
  }

  /**
   * Creates a new group
   * @param groupName - Name of Group to create
   * @param groupDescription - Group description
   */
  public async createGroupIfNotExist(
    groupName: string,
    groupDescription: string,
    user: AuthenticatedUser
  ): Promise<void> {
    console.log(`Creating ${groupName} group.`);
    try {
      await this._authService.createGroup({
        groupId: groupName,
        description: groupDescription,
        authenticatedUser: user
      });
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
   * Assigns user to group
   * @param userId - Group description
   * @param groupName - Name of the Group to assign
   */
  public async assignUserToGroup(userId: string, groupName: string, user: AuthenticatedUser): Promise<void> {
    console.log(`Assigning user ${userId} to ${groupName} group.`);
    await this._authService.addUserToGroup({
      groupId: groupName,
      userId,
      authenticatedUser: user
    });

    console.log(`Assigned user ${userId} to ${groupName} group.`);
  }

  /**
   * Creates set of permissions
   * @param permissions - Permissions to create
   */
  public async createIdentityPermissions(
    permissions: IdentityPermission[],
    user: AuthenticatedUser
  ): Promise<void> {
    console.log(`Creating identity permissions.`);
    try {
      await this._authService.createIdentityPermissions({
        identityPermissions: permissions,
        authenticatedUser: user
      });
    } catch (err) {
      if (isIdentityPermissionCreationError(err)) {
        console.warn(err);
        return;
      }

      throw err;
    }
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
