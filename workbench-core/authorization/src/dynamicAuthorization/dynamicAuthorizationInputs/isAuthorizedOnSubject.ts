import { AuthenticatedUser } from '../../authenticatedUser';
import { DynamicOperation } from './dynamicOperation';

/**
 * Request object for IsAuthorizedOnSubjectRequest
 */
export interface IsAuthorizedOnSubjectRequest {
  /**
   * {@link AuthenticatedUser}
   */
  user: AuthenticatedUser;
  /**
   * {@link DynamicOperation}
   */
  dynamicOperation: DynamicOperation;
}
