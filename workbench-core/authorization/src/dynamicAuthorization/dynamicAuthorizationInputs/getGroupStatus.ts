import { GroupStatus } from '../models/GroupMetadata';

/**
 * Request object for GetGroupStatus
 */
export interface GetGroupStatusRequest {
  /**
   * Group id associated to the group the status is being retrieved for
   */
  groupId: string;
}
/**
 * Response object for SetGroupStatus
 */
export interface GetGroupStatusResponse {
  /**
   * The group {@link GroupStatus}
   */
  status: GroupStatus;
}
