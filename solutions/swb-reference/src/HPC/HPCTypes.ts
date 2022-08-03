import { AwsService } from '@aws/workbench-core-base';

export interface JobParameters {
  s3DataFolder: string;
  command: string;
  job_name: string;
  nodes: number;
  ntasks: number;
  partition: string;
}

export interface AwsServiceWithCredentials {
  awsService: AwsService;
  credentials: {
    AccessKeyId: string;
    SecretAccessKey: string;
    SessionToken: string;
  };
}

export interface SSMCommandStatus {
  CommandId: string;
  InstanceId: string;
  ResponseCode: number;
  StandardOutputContent: Record<string, string>;
  Status: string;
  StatusDetails: string;
}

export interface Cluster {
  cloudformationStackArn: string;
  clusterName: string;
  creationTime?: string;
  headNode?: {
    instanceId: string;
    instanceType: string;
    launchTime: string;
    privateIpAddress: string;
    publicIpAddress: string;
    state: string;
  };
  region: string;
  version: string;
}
