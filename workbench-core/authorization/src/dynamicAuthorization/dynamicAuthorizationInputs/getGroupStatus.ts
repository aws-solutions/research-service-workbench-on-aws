import { Status } from '../status';

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
   * The group {@link Status}
   */
  status: Status;
}
