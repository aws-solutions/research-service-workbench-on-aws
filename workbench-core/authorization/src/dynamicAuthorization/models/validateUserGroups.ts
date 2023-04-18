import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ValidateUserGroupsRequestParser = z.object({
  /**
   * User ID being validated
   */
  userId: z.string(),
  /**
   * Array of group IDs being validated
   */
  groupIds: z.array(z.string())
});

/**
 * Request object for ValidateUserGroups
 */
export type ValidateUserGroupsRequest = z.infer<typeof ValidateUserGroupsRequestParser>;

/**
 * Response object for ValidateUserGroups
 */
export interface ValidateUserGroupsResponse {
  validGroupIds: string[];
}
