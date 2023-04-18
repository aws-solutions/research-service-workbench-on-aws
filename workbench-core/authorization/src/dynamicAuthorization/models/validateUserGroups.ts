import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ValidateUserGroupsRequestParser = z.object({
  userId: z.string(),
  groupIds: z.array(z.string())
});

export type ValidateUserGroupsRequest = z.infer<typeof ValidateUserGroupsRequestParser>;

/**
 *
 */
export interface ValidateUserGroupsResponse {
  validGroupIds: string[];
}
