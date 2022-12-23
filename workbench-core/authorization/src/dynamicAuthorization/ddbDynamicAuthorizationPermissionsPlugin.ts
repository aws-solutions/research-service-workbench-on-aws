import { AwsService, JSONValue } from '@aws/workbench-core-base';
import { Action } from '../action';
import { IdentityPermissionCreationError } from '../errors/identityPermissionCreationError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { Effect } from '../permission';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/createIdentityPermissions';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/deleteIdentityPermissions';
import {
  GetDynamicOperationsByRouteRequest,
  GetDynamicOperationsByRouteResponse
} from './dynamicAuthorizationInputs/getDynamicOperationsByRoute';
import {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsByIdentity';
import {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsBySubject';
import { IdentityPermission, IdentityType } from './dynamicAuthorizationInputs/identityPermission';
import { IsRouteIgnoredRequest, IsRouteIgnoredResponse } from './dynamicAuthorizationInputs/isRouteIgnored';
import {
  IsRouteProtectedRequest,
  IsRouteProtectedResponse
} from './dynamicAuthorizationInputs/isRouteProtected';
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';

export class DDBDynamicAuthorizationPermissionsPlugin implements DynamicAuthorizationPermissionsPlugin {
  private _awsService: AwsService;

  public constructor(config: { awsService: AwsService }) {
    this._awsService = config.awsService;
  }

  public async isRouteIgnored(isRouteIgnoredRequest: IsRouteIgnoredRequest): Promise<IsRouteIgnoredResponse> {
    throw new Error('Method not implemented.');
  }
  public async isRouteProtected(
    isRouteProtectedRequest: IsRouteProtectedRequest
  ): Promise<IsRouteProtectedResponse> {
    throw new Error('Method not implemented.');
  }
  public async getDynamicOperationsByRoute(
    getDynamicOperationsByRouteRequest: GetDynamicOperationsByRouteRequest
  ): Promise<GetDynamicOperationsByRouteResponse> {
    throw new Error('Method not implemented.');
  }
  public async getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse> {
    throw new Error('Method not implemented.');
  }
  public async getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse> {
    throw new Error('Method not implemented.');
  }
  public async createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    const { identityPermissions } = createIdentityPermissionsRequest;
    //Check if there are 100 ops
    if (identityPermissions.length > 100)
      throw new ThroughputExceededError('Exceeds 100 identity permissions');

    //Create an item with createIdenttiyPermissions
    const putRequests = identityPermissions.map((identityPermission) => {
      const item = this._transformIdentityPermissionsToItem(identityPermission);
      const conditionExpression = 'attribute_not_exists(pk)';
      return {
        item,
        conditionExpression
      };
    });

    // Will fail entire transaction if a single one fails
    try {
      await this._awsService.helpers.ddb.commitTransaction({
        addPutRequests: putRequests
      });
    } catch (err) {
      if (err.name === 'TransactionCanceledException') {
        throw new IdentityPermissionCreationError(`Failed due to an exception: ${err.message}`);
      }
      throw err;
    }

    return {
      data: {
        identityPermissions
      }
    };
  }
  public async deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  /**
   * @param identityPermission - {@link IdentityPermission} to be transformed
   *
   * Transforms data into this form
   * ```
   * {
   *  "*pk*" : "<subjectType>|<subject_id>" // partition key
   *  "*sk*": " <CRUD Action> | <effect> | <IdentityType>|<IdentityId>" // sort key
   *  "identity": "<IdentityType>|<IdentityId>"
   *  "effect": "ALLOW | DENY"
   *  "action" : "<CRUD Action>"
   *  "conditions": {}
   *  "fields": []
   *  "description": "Description of identity"
   * }
   * ```
   * @returns
   */
  private _transformIdentityPermissionsToItem(
    identityPermission: IdentityPermission
  ): Record<string, JSONValue | Set<JSONValue>> {
    const { subjectType, subjectId, action, effect, identityType, identityId } = identityPermission;
    const pk = this._createIdentityPermissionsPartitionKey(subjectType, subjectId);
    const sk = this._createIdentityPermissionsSortKey(action, effect, identityType, identityId);
    const identity = `${identityType}|${identityId}`;
    const conditions = identityPermission.conditions ?? {};
    const fields = identityPermission.fields ?? [];
    const description = identityPermission.description ?? '';
    return {
      pk,
      sk,
      action,
      effect,
      identity,
      conditions,
      fields,
      description
    };
  }

  private _createIdentityPermissionsPartitionKey(subjectType: string, subjectId: string): string {
    return `${subjectType}|${subjectId}`;
  }

  private _createIdentityPermissionsSortKey(
    action: Action,
    effect: Effect,
    identityType: IdentityType,
    identityId: string
  ): string {
    return `${action}|${effect}|${identityType}|${identityId}`;
  }
}
