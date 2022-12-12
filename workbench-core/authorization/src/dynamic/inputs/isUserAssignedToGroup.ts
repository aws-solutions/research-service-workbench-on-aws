export interface IsUserAssignedToGroupRequest {
  userId: string;
  groupName: string;
}

export interface IsUserAssignedToGroupResponse {
  assigned: boolean;
}
