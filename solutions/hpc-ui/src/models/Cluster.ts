export type Cluster = {
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
};

export type Job = {
  name: string;
  nodes: string;
  partition: string;
  job_state: JobStatus;
  job_id: number;
  start_time: number;
  end_time: number;
};

export type SSMCommandStatus = {
  CommandId: string;
  InstanceId: string;
  ResponseCode: number;
  StandardOutputContent: [Record<string, string>];
  Status: string;
  StatusDetails: string;
};

export type JobStatus = 'CONFIGURING' | 'STOPPING' | 'FAILED' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
