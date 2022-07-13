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

export interface Job {
  name: string;
  nodes: string;
  partition: string;
  job_state: JobStatus;
  job_id: number;
  start_time: number;
  end_time: number;
}

export interface SSMCommandStatus {
  CommandId: string;
  InstanceId: string;
  ResponseCode: number;
  StandardOutputContent: [Record<string, string>];
  Status: string;
  StatusDetails: string;
}

export interface JobParameters {
  command: string;
  job_name: string;
  nodes: number;
  ntasks: number;
  partition: string;
}

export interface Project {
  pk: string;
  sk: string;
  id: string;
  resourceType: string;
  envMgmtRoleArn: string;
  externalId: string;
  accountHandlerRoleArn: string;
  accountId: string;
  awsAccountId: string;
  createdAt: string;
  createdBy: string;
  dependency: string;
  description: string;
  encryptionKeyArn: string;
  environmentInstanceFiles: string;
  indexId: string;
  name: string;
  owner: string;
  projectAdmins: string[];
  subnetId: string;
  updatedAt: string;
  updatedBy: string;
  vpcId: string;
}

export type JobStatus = 'CONFIGURING' | 'STOPPING' | 'FAILED' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
