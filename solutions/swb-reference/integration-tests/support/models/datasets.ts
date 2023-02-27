export interface DatasetItemResponse {
  id: string;
}

export interface ListDatasetsResponse {
  data: {
    data: DatasetItemResponse[];
  };
}
