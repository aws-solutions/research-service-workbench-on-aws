export interface AddUserToGroupRequest {
  userId: string;
  groupName: string;
}

export interface AddUserToGroupResponse {
  added: boolean;
}
