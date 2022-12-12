export interface SetGroupStatusRequest {
  groupName: string;
  status: string;
}

export interface SetGroupStatusResponse {
  statusSet: boolean;
}
