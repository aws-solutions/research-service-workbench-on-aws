export interface EnvironmentTypeConfigItemResponse {
  id: string;
}

export interface ListETCsResponse {
  data: {
    data: EnvironmentTypeConfigItemResponse[];
  };
}
