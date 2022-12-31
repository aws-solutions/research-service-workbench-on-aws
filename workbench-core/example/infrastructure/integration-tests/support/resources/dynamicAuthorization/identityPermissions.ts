import {
  AuthenticatedUser,
  CreateIdentityPermissionsRequest,
  Identity,
  IdentityPermission as Permission
} from '@aws/workbench-core-authorization';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import IdentityPermission from './identityPermission';

function createPermissionId(identityPermission: Permission): string {
  const { subjectId, subjectType, identityId, identityType, effect, action } = identityPermission;
  return `${subjectType}|${subjectId}|${action}|${effect}|${identityType}|${identityId}`;
}

export default class IdentityPermissions extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'identityPermissions', 'identityPermission', 'authorization');
    this._api = `${this._parentApi}/identity-permissions`;
  }

  public identityPermission(identityPermission: Permission, id: string): IdentityPermission {
    return new IdentityPermission(identityPermission, this._clientSession, '', id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async create(body: any = {}, applyDefault: boolean = true): Promise<AxiosResponse> {
    // Because of the cleanup logic, before we do the create, we need to ensure that the extender of this collection
    // resource class has a method that returns the resource operations helper for the child resource.
    // For example, if the extender class is 'Users' and it provides childType = 'user', then Users class must have
    // a method called 'user()'.
    const requestBody = applyDefault ? this._buildDefaults(body) : body;
    const response: AxiosResponse = await this._axiosInstance.post(`${this._api}`, requestBody);

    const { identityPermissions } = response.data;

    identityPermissions.forEach((identityPermission: Permission) => {
      const taskId = `${this._childType}-${createPermissionId(identityPermission)}`;
      const resourceNode = this.identityPermission(
        identityPermission,
        createPermissionId(identityPermission)
      );
      this.children.set(resourceNode.id, resourceNode);
      // We add a cleanup task to the cleanup queue for the session
      this._clientSession.addCleanupTask({ id: taskId, task: async () => resourceNode.cleanup() });
    });

    return response;
  }

  protected _buildDefaults(resource: CreateRequest): CreateIdentityPermissionsRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));

    const { identities, authenticatedUser } = resource;
    const identityPermissions: Permission[] = [];

    identities.forEach((identity) => {
      const subjectId = randomTextGenerator.getFakeText('sampleSubjectId');
      const subjectType = randomTextGenerator.getFakeText('sampleSubjectType');

      const action = 'CREATE';
      const effect = 'ALLOW';
      identityPermissions.push({
        subjectId,
        subjectType,
        action,
        effect,
        identityId: identity.identityId,
        identityType: identity.identityType
      });
    });
    return {
      identityPermissions,
      authenticatedUser
    };
  }
}

interface CreateRequest {
  identities: Identity[];
  authenticatedUser: AuthenticatedUser;
}
