export interface RemoveUserFromGroupRequest {
  userId: string;
  groupName: string;
}

export interface RemoveUserFromGroupResponse {
  removed: boolean;
}
