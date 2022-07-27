/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import Boom from '@hapi/boom';
import aws4 from 'aws4';
import { Request } from 'express';
import HPCServiceHelper from './HPCServiceHelper';
import { JobParameters, SSMCommandStatus, Cluster } from './HPCTypes';

export default class HPCService {
  public helper: HPCServiceHelper;

  public constructor() {
    this.helper = new HPCServiceHelper();
  }

  public async getAwsCluster(req: Request): Promise<Cluster> {
    const awsEnvMgt = await this.helper.awsAssumeEnvMgt(req.params.projectId);

    const opts = {
      host: process.env.PCLUSTER_API_URL!,
      service: 'execute-api',
      region: process.env.AWS_REGION!,
      method: 'GET',
      path: '/prod/v3/clusters'
    };

    if (req.params.clusterName) {
      opts.path = `/prod/v3/clusters/${req.params.clusterName}`;
    } else {
      throw Boom.notFound(`No cluster name provided.`);
    }

    const creds = {
      accessKeyId: awsEnvMgt.credentials.AccessKeyId,
      secretAccessKey: awsEnvMgt.credentials.SecretAccessKey,
      sessionToken: awsEnvMgt.credentials.SessionToken
    };

    const signed: aws4.Request = aws4.sign(opts, creds);

    return this.helper.sendSignedClusterRequest(req, signed) as Promise<Cluster>;
  }

  public async listAwsClusters(req: Request): Promise<Cluster[]> {
    const awsEnvMgt = await this.helper.awsAssumeEnvMgt(req.params.projectId);

    const opts = {
      host: process.env.PCLUSTER_API_URL!,
      service: 'execute-api',
      region: process.env.AWS_REGION!,
      method: 'GET',
      path: '/prod/v3/clusters'
    };

    const creds = {
      accessKeyId: awsEnvMgt.credentials.AccessKeyId,
      secretAccessKey: awsEnvMgt.credentials.SecretAccessKey,
      sessionToken: awsEnvMgt.credentials.SessionToken
    };

    const signed: aws4.Request = aws4.sign(opts, creds);

    return this.helper.sendSignedClusterRequest(req, signed) as Promise<Cluster[]>;
  }

  public async getJobQueue(req: Request): Promise<SSMCommandStatus> {
    return this.helper.executeSSMCommand(
      req.params.projectId,
      req.params.instanceId,
      'squeue',
      'squeue --json | jq .jobs\\|\\map\\({name,nodes,partition,job_state,job_id,start_time,end_time\\}\\)'
    );
  }

  public async submitJob(req: Request): Promise<SSMCommandStatus> {
    const jobParams = req.body as JobParameters;

    const regex = /(?<=\/)([A-Za-z0-9-].*?)(?=\/)/g;

    const pathMatches = jobParams.s3DataFolder.match(regex);

    const s3FolderName = pathMatches![pathMatches!.length - 1];

    return this.helper.executeSSMCommand(
      req.params.projectId,
      req.params.instanceId,
      'sbatch',
      `rm -rf ${s3FolderName} && mkdir ${s3FolderName} && mkdir ${s3FolderName}/output && aws s3 cp ${jobParams.s3DataFolder} ${s3FolderName} --recursive && cd ${s3FolderName}/output && sbatch --job-name ${jobParams.job_name} --nodes ${jobParams.nodes} --ntasks ${jobParams.ntasks}  --partition ${jobParams.partition} ../${jobParams.command}`
    );
  }

  public async cancelJob(req: Request): Promise<SSMCommandStatus> {
    return this.helper.executeSSMCommand(
      req.params.projectId,
      req.params.instanceId,
      'scancel',
      `scancel ${req.params.jobId}`
    );
  }
}
