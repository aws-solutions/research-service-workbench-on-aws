/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, Metadata } from '@aws/workbench-core-audit';
import _ from 'lodash';
import { Action } from '../action';
import AuthorizationPlugin from '../authorizationPlugin';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { ParamNotFoundError } from '../errors/paramNotFoundError';
import { RetryError } from '../errors/retryError';
import { RouteNotSecuredError } from '../errors/routeNotSecuredError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { AddUserToGroupRequest, AddUserToGroupResponse } from './dynamicAuthorizationInputs/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsRequestParser,
  CreateIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/createIdentityPermissions';
import { DeleteGroupRequest, DeleteGroupResponse } from './dynamicAuthorizationInputs/deleteGroup';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsRequestParser,
  DeleteIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/deleteIdentityPermissions';
import {
  DeleteSubjectIdentityPermissionsRequest,
  DeleteSubjectIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/deleteSubjectIdentityPermissions';
import { DoesGroupExistRequest, DoesGroupExistResponse } from './dynamicAuthorizationInputs/doesGroupExist';
import { GetGroupUsersRequest, GetGroupUsersResponse } from './dynamicAuthorizationInputs/getGroupUsers';
import {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityRequestParser,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsByIdentity';
import {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectRequestParser,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsBySubject';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import { Identity, IdentityPermission } from './dynamicAuthorizationInputs/identityPermission';
import {
  IsAuthorizedOnRouteRequest,
  IsAuthorizedOnRouteRequestParser
} from './dynamicAuthorizationInputs/isAuthorizedOnRoute';
import {
  IsAuthorizedOnSubjectRequest,
  IsAuthorizedOnSubjectRequestParser
} from './dynamicAuthorizationInputs/isAuthorizedOnSubject';
import {
  IsRouteIgnoredRequest,
  IsRouteIgnoredRequestParser,
  IsRouteIgnoredResponse
} from './dynamicAuthorizationInputs/isRouteIgnored';
import {
  IsRouteProtectedRequest,
  IsRouteProtectedRequestParser,
  IsRouteProtectedResponse
} from './dynamicAuthorizationInputs/isRouteProtected';
import {
  IsUserAssignedToGroupRequest,
  IsUserAssignedToGroupResponse
} from './dynamicAuthorizationInputs/isUserAssignedToGroup';
import {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicAuthorizationInputs/removeUserFromGroup';
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';
import { GroupManagementPlugin } from './groupManagementPlugin';

export class DynamicAuthorizationService {
  private readonly _wildcardSubjectId: string = '*';

  private _groupManagementPlugin: GroupManagementPlugin;
  private _dynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin;
  private _authorizationPlugin: AuthorizationPlugin;
  private _auditService: AuditService;

  public constructor(config: {
    groupManagementPlugin: GroupManagementPlugin;
    dynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin;
    auditService: AuditService;
    authorizationPlugin: AuthorizationPlugin;
  }) {
    this._groupManagementPlugin = config.groupManagementPlugin;
    this._dynamicAuthorizationPermissionsPlugin = config.dynamicAuthorizationPermissionsPlugin;
    this._auditService = config.auditService;
    this._authorizationPlugin = config.authorizationPlugin;
  }

  /**
   * Checks whether a {@link AuthenticatedUser} is authorized to perform {@link isAuthorizedOnSubjectRequest}
   * @param isAuthorizedOnSubjectRequest - {@link IsAuthorizedOnSubjectRequest}
   *
   * @throws - {@link ForbiddenError} when {@link AuthenticatedUser} is not authorized.
   */
  public async isAuthorizedOnSubject(
    isAuthorizedOnSubjectRequest: IsAuthorizedOnSubjectRequest
  ): Promise<void> {
    const validatedRequest = IsAuthorizedOnSubjectRequestParser.parse(isAuthorizedOnSubjectRequest);
    const { authenticatedUser, dynamicOperation } = validatedRequest;
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.isAuthorizedOnSubject.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: validatedRequest
    };
    try {
      const { roles, id } = authenticatedUser;
      const { subject, action } = dynamicOperation;
      const { subjectId, subjectType } = subject;
      //Create group identities
      const identities: Identity[] = roles.map((groupId) => {
        return {
          identityType: 'GROUP',
          identityId: groupId
        };
      });
      //Add user identity
      identities.push({
        identityType: 'USER',
        identityId: id
      });
      const identityPermissionsPromise = this._getAllIdentityPermissionsBySubject({
        subjectId,
        subjectType,
        action,
        identities
      });
      const identityPermissionsPromises = [identityPermissionsPromise];
      if (subjectId !== this._wildcardSubjectId) {
        const wildcardIdentityPermissionsPromise = this._getAllIdentityPermissionsBySubject({
          subjectId: this._wildcardSubjectId,
          subjectType,
          action,
          identities
        });
        identityPermissionsPromises.push(wildcardIdentityPermissionsPromise);
      }
      const [identityPermissions, wildcardIdentityPermissions] = await Promise.all(
        identityPermissionsPromises
      );
      await this._authorizationPlugin.isAuthorizedOnDynamicOperations(
        [...identityPermissions, ...(wildcardIdentityPermissions ?? [])],
        [dynamicOperation]
      );
      metadata.statusCode = 200;
      await this._auditService.write(metadata);
    } catch (err) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, err);
      throw err;
    }
  }

  /**
   * Checks if a route is ignored
   * @param isRouteIgnoredRequest - {@link IsRouteIgnoredRequest}
   *
   * @returns - {@link IsRouteIgnoredResponse}
   */
  public async isRouteIgnored(isRouteIgnoredRequest: IsRouteIgnoredRequest): Promise<IsRouteIgnoredResponse> {
    const validatedRequest = IsRouteIgnoredRequestParser.parse(isRouteIgnoredRequest);
    return this._dynamicAuthorizationPermissionsPlugin.isRouteIgnored(validatedRequest);
  }
  /**
   * Checks if a route is protected
   * @param isRouteProtectedRequest - {@link IsRouteProtectedRequest}
   *
   * @returns - {@link IsRouteProtectedResponse}
   */
  public async isRouteProtected(
    isRouteProtectedRequest: IsRouteProtectedRequest
  ): Promise<IsRouteProtectedResponse> {
    const validatedRequest = IsRouteProtectedRequestParser.parse(isRouteProtectedRequest);
    return this._dynamicAuthorizationPermissionsPlugin.isRouteProtected(validatedRequest);
  }
  /**
   * Checks whether a {@link AuthenticatedUser} is authorized on a route
   * @param isAuthorizedOnRouteRequest - {@link IsAuthorizedOnRouteRequest}
   *
   * @throws - {@link ForbiddenError} when {@link AuthenticatedUser} is not authorized.
   *
   */
  public async isAuthorizedOnRoute(isAuthorizedOnRouteRequest: IsAuthorizedOnRouteRequest): Promise<void> {
    const validatedRequest = IsAuthorizedOnRouteRequestParser.parse(isAuthorizedOnRouteRequest);
    const { authenticatedUser, route, method, params } = validatedRequest;
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.isAuthorizedOnRoute.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: validatedRequest
    };
    try {
      if ((await this.isRouteIgnored({ route, method })).data.routeIgnored) {
        metadata.statusCode = 200;
        await this._auditService.write(metadata);
        return;
      }
      if (!(await this.isRouteProtected({ route, method })).data.routeProtected)
        throw new RouteNotSecuredError('Route is not secured');
      const { data: dynamicOperationsData } =
        await this._dynamicAuthorizationPermissionsPlugin.getDynamicOperationsByRoute({ route, method });
      const dynamicOperations = _.cloneDeep(dynamicOperationsData.dynamicOperations);
      // Inject subject's variable based params
      const paramRegex = /\${([^{]+)}/g;
      dynamicOperations.forEach((dynamicOperation) => {
        Object.entries(dynamicOperation.subject).forEach(([subjectKey, subjectValue]) => {
          _.set(
            dynamicOperation.subject,
            subjectKey,
            subjectValue.replace(paramRegex, (ignore, key) => {
              const response = _.get(params, key);
              if (!response) throw new ParamNotFoundError('Missing parameter');
              return response;
            })
          );
        });
      });
      for (const dynamicOperation of dynamicOperations) {
        await this.isAuthorizedOnSubject({ authenticatedUser, dynamicOperation });
      }
      metadata.statusCode = 200;
      await this._auditService.write(metadata);
    } catch (err) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, err);
      throw err;
    }
  }

  /**
   * Create an authorization group
   * @param createGroupRequest - {@link CreateGroupRequest}
   *
   * @returns a {@link CreateGroupResponse}
   *
   * @throws {@link GroupAlreadyExistsError} - Can not create a group that already exists
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async createGroup(createGroupRequest: CreateGroupRequest): Promise<CreateGroupResponse> {
    const metadata: Metadata = {
      actor: createGroupRequest.authenticatedUser,
      action: this.createGroup.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: createGroupRequest
    };

    try {
      const response = await this._groupManagementPlugin.createGroup(createGroupRequest);

      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (error) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, error);

      throw error;
    }
  }

  /**
   * Delete an authorization group
   * @param deleteGroupRequest - {@link DeleteGroupRequest}
   *
   * @returns - {@link DeleteGroupResponse}
   */
  public async deleteGroup(deleteGroupRequest: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    const { authenticatedUser, groupId } = deleteGroupRequest;
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.deleteGroup.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: deleteGroupRequest
    };

    let identityPermissions: IdentityPermission[];

    try {
      const { data } = await this.getIdentityPermissionsByIdentity({
        identityId: groupId,
        identityType: 'GROUP'
      });

      identityPermissions = data.identityPermissions;

      await this._groupManagementPlugin.setGroupStatus({
        groupId,
        status: 'delete_pending'
      });
    } catch (error) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, error);

      throw error;
    }

    if (identityPermissions.length > 0) {
      try {
        await this.deleteIdentityPermissions({
          authenticatedUser,
          identityPermissions
        });
      } catch (error) {
        metadata.statusCode = 400;
        await this._auditService.write(metadata, error);
        throw new RetryError(error.message);
      }
    }

    try {
      const response = await this._groupManagementPlugin.deleteGroup(deleteGroupRequest);

      await this._groupManagementPlugin.setGroupStatus({
        groupId,
        status: 'deleted'
      });

      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (error) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, error);

      throw error;
    }
  }

  /**
   * Create identity permissions, limited to 100 identity permissions
   * @param createIdentityPermissionsRequest - {@link CreateIdentityPermissionsRequest}
   *
   * @returns - {@link CreateIdentityPermissionsResponse}
   *
   * @throws - {@link IdentityPermissionAlreadyExistError} Can not create an identity permission that already exists.
   * @throws - {@link ThroughputExceededError} Can not exceed 100 identity permissions
   * @throws - {@link GroupNotValid} Can only create permissions for 'active' groups
   */
  public async createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    createIdentityPermissionsRequest = CreateIdentityPermissionsRequestParser.parse(
      createIdentityPermissionsRequest
    );
    const { authenticatedUser } = createIdentityPermissionsRequest;
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.createIdentityPermissions.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: createIdentityPermissionsRequest
    };
    try {
      const response = await this._createIdentityPermissions(createIdentityPermissionsRequest);

      //Write audit entry when success
      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (err) {
      //Write audit entry when failure
      metadata.statusCode = 400;
      await this._auditService.write(metadata, err);
      throw err;
    }
  }
  /**
   * Delete identity permissions
   * @param deleteIdentityPermissionsRequest - {@link DeleteIdentityPermissionsRequest}
   *
   * @returns - {@link DeleteIdentityPermissionsResponse}
   */
  public async deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse> {
    const validatedRequest = DeleteIdentityPermissionsRequestParser.parse(deleteIdentityPermissionsRequest);
    const { authenticatedUser } = validatedRequest;
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.deleteIdentityPermissions.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: validatedRequest
    };
    try {
      const response = await this._dynamicAuthorizationPermissionsPlugin.deleteIdentityPermissions(
        validatedRequest
      );
      //Write audit entry when success
      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (err) {
      //Write audit entry when failure
      metadata.statusCode = 400;
      await this._auditService.write(metadata, err);
      throw err;
    }
  }

  /**
   * Get all identity permissions associated to a specific subject
   * @param getIdentityPermissionsBySubjectRequest - {@link GetIdentityPermissionsBySubjectRequest}
   *
   * @returns - {@link GetIdentityPermissionsBySubjectResponse}
   */
  public async getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse> {
    const validatedRequest = GetIdentityPermissionsBySubjectRequestParser.parse(
      getIdentityPermissionsBySubjectRequest
    );
    return this._dynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject(validatedRequest);
  }

  /**
   * Get all identity permissions associated to a specific identity
   * @param getIdentityPermissionsByIdentityRequest - {@link GetIdentityPermissionsByIdentityRequest}
   *
   * @returns - {@link GetIdentityPermissionsByIdentityResponse}
   */
  public async getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse> {
    const validatedRequest = GetIdentityPermissionsByIdentityRequestParser.parse(
      getIdentityPermissionsByIdentityRequest
    );
    return this._dynamicAuthorizationPermissionsPlugin.getIdentityPermissionsByIdentity(validatedRequest);
  }

  /**
   * Add a user to an authorization group
   * @param addUserToGroupRequest - {@link AddUserToGroupRequest}
   *
   * @returns - {@link AddUserToGroupResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link GroupNotFoundError} - group could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async addUserToGroup(addUserToGroupRequest: AddUserToGroupRequest): Promise<AddUserToGroupResponse> {
    const { authenticatedUser } = addUserToGroupRequest;
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.addUserToGroup.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: addUserToGroupRequest
    };

    try {
      const response = await this._groupManagementPlugin.addUserToGroup(addUserToGroupRequest);
      //Write audit entry when success
      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (err) {
      //Write audit entry when failure
      metadata.statusCode = 400;
      await this._auditService.write(metadata, err);
      throw err;
    }
  }

  /**
   * Remove a user from an authorization group
   * @param removeUserFromGroupRequest - {@link RemoveUserFromGroupRequest}
   *
   * @returns - {@link RemoveUserFromGroupResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link GroupNotFoundError} - group could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async removeUserFromGroup(
    removeUserFromGroupRequest: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse> {
    const metadata: Metadata = {
      actor: removeUserFromGroupRequest.authenticatedUser,
      action: this.removeUserFromGroup.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: removeUserFromGroupRequest
    };

    try {
      const response = await this._groupManagementPlugin.removeUserFromGroup(removeUserFromGroupRequest);

      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (error) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, error);

      throw error;
    }
  }

  /**
   * Get all users associated to the group
   * @param getGroupUsersRequest - {@link GetGroupUsersRequest}
   *
   * @returns - {@link GetGroupUsersResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link GroupNotFoundError} - group could not be found
   */
  public async getGroupUsers(getGroupUsersRequest: GetGroupUsersRequest): Promise<GetGroupUsersResponse> {
    return await this._groupManagementPlugin.getGroupUsers(getGroupUsersRequest);
  }

  /**
   * Get all groups associated to the user
   * @param getUserGroupsRequest - {@link GetUserGroupsRequest}
   *
   * @returns - {@link GetUserGroupsResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async getUserGroups(getUserGroupsRequest: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    return this._groupManagementPlugin.getUserGroups(getUserGroupsRequest);
  }

  /**
   * Check if a user is assigned to a group
   * @param isUserAssignedToGroupRequest - {@link IsUserAssignedToGroupRequest}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async isUserAssignedToGroup(
    isUserAssignedToGroupRequest: IsUserAssignedToGroupRequest
  ): Promise<IsUserAssignedToGroupResponse> {
    return this._groupManagementPlugin.isUserAssignedToGroup(isUserAssignedToGroupRequest);
  }

  /**
   * Check if a group exist
   * @param doesGroupExistRequest - {@link DoesGroupExistRequest}
   *
   * @returns - {@link DoesGroupExistResponse}
   */
  public async doesGroupExist(doesGroupExistRequest: DoesGroupExistRequest): Promise<DoesGroupExistResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Delete all subject identity permissions.
   * @param DeleteSubjectIdentityPermissionsRequest - {@link DeleteSubjectIdentityPermissionsRequest}
   *
   * @returns - {@link DeleteIdentityPermissionsResponse}
   */
  public async deleteSubjectIdentityPermissions(
    deleteSubjectIdentityPermissionsRequest: DeleteSubjectIdentityPermissionsRequest
  ): Promise<DeleteSubjectIdentityPermissionsResponse> {
    const metadata: Metadata = {
      actor: deleteSubjectIdentityPermissionsRequest.authenticatedUser,
      action: this.deleteSubjectIdentityPermissions.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: deleteSubjectIdentityPermissionsRequest
    };

    try {
      const response = await this._dynamicAuthorizationPermissionsPlugin.deleteSubjectIdentityPermissions(
        deleteSubjectIdentityPermissionsRequest
      );

      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (error) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, error);

      throw error;
    }
  }

  private async _createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    const { identityPermissions } = createIdentityPermissionsRequest;
    if (identityPermissions.length > 100)
      throw new ThroughputExceededError('Exceeds 100 identity permissions');

    //Verify all groups are valid to create identity permissions
    const groupIds = new Set<string>();
    identityPermissions.forEach((identityPermission) => {
      if (identityPermission.identityType === 'GROUP') groupIds.add(identityPermission.identityId);
    });
    const promises = Array.from(groupIds).map((groupId) => {
      return this._groupManagementPlugin.getGroupStatus({ groupId });
    });
    const groupStatusResponses = await Promise.all(promises);

    groupStatusResponses.forEach((groupSatusResponse) => {
      if (groupSatusResponse.data.status !== 'active')
        throw new GroupNotFoundError('One or more groups are not found');
    });

    //Create identity permissions
    return await this._dynamicAuthorizationPermissionsPlugin.createIdentityPermissions(
      createIdentityPermissionsRequest
    );
  }

  private async _getAllIdentityPermissionsBySubject(params: {
    subjectId: string;
    subjectType: string;
    action: Action;
    identities: Identity[];
  }): Promise<IdentityPermission[]> {
    const { subjectId, subjectType, action, identities } = params;
    let paginationToken = undefined;
    let identityPermissions: IdentityPermission[] = [];
    //paginate through response
    do {
      // get all identity permissions associated to subject filtered on action and identities
      const response: GetIdentityPermissionsBySubjectResponse =
        await this._dynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject({
          subjectId,
          subjectType,
          action,
          identities,
          paginationToken
        });
      paginationToken = response.paginationToken;
      identityPermissions = identityPermissions.concat(response.data.identityPermissions);
    } while (paginationToken);
    return identityPermissions;
  }
}
