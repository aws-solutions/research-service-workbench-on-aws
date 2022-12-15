export interface DataSetExternalEndpointRequest {
  dataSetId: string;
  externalEndpointName: string;
  externalRoleName?: string;
  kmsKeyArn?: string;
  vpcId?: string;
}
