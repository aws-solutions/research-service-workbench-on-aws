import { Action } from '../action';
import { Effect } from '../permission';

/**
 * DynamoDb Identity Permission Item
 */
export interface DynamoDBIdentityPermissionItem {
  [key: string]: unknown;
  /**
   * Parition Key is a composite of SubjectType and SubjectId
   */
  pk: string;
  /**
   * Sort Key is a composite of IdentityType and IdentityId
   */
  sk: string;
  /**
   * {@link Action}
   */
  action: Action;
  /**
   * {@link Effect}
   */
  effect: Effect;
  /**
   * Subject Type
   */
  subjectType: string;
  /**
   * Subject Id
   */
  subjectId: string;
  /**
   * The identity which is represented as a composite key of IdentityId and IdentityType
   */
  identity: string;
  /**
   * Used to conditionally restrict a {@link User}'s action
   */
  conditions: { [key: string]: unknown };
  /**
   * Used to restrict a {@link User}'s action on the subject
   * to a specific field/child subject.
   */
  fields: string[];
}
