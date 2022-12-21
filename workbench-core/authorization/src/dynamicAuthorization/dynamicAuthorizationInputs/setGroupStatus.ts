import { GroupStatus } from '../models/GroupMetadata';

/**
 * Request object for SetGroupStatus
 */
export interface SetGroupStatusRequest {
  /**
   * Group id associated to the group the status is being set on
   */
  groupId: string;
  /**
   *  {@link GroupStatus} to set
   */
  status: GroupStatus;
}
/**
 * Response object for SetGroupStatus
 */
export interface SetGroupStatusResponse {
  /**
   * The data object returned
   */
  data: {
    /**
     * The set status
     */
    status: GroupStatus;
  };
}