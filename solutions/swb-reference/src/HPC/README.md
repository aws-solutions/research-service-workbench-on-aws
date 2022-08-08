# AWS ParallelClusters API Backend on SWB

## Requirements
The requirements utilizing the HPC backend on SWB:
1. Deploy Pcluster Manager stack and deploy clusters to Hosting Account. 
Instructions for deploying the stack can be found [here](https://pcluster.cloud/01-getting-started.html). Information on creating clusters are also here in [this video review of Pcluster Manager](https://www.youtube.com/watch?v=Z1vlpJYb1KQ).
2. Deploy ParallelCluster Stack API onto the Hosting Account under the region for where your clusters reside such as `us-east-1`. Use version `3.14` of [ParallelCluster Stack API](https://docs.aws.amazon.com/parallelcluster/latest/ug/api-reference-v3.html). For the parameters make sure to set CreateAPIUserRole to `false` to invoke the API from any IAM role, and as well specify the region for where the clusters reside such as `us-east-1`. Take note of the `ParallelClusterApiID` in CFN stack output `ParallelClusterApiInvokeUrl`. The value should have this format `https://<ParallelClusterApiID>.execute-api.<region>.amazonaws.com/prod`. This value will be used when onboarding a hosting account.
3. An email should be sent to the email address you provided in Step 1. Follow the instructions in that email to log into PCluster manager and create a PCluster.
4. In the UI, click `Create Cluster` and then choose `Wizard`. Follow the wizard to generate a `Configuration` for launching your PCluster. The configuration should look something like this.
```yaml
HeadNode:
  InstanceType: t2.medium
  Networking:
    SubnetId: subnet-abc123
  LocalStorage:
    RootVolume:
      Size: 50
  Iam:
    AdditionalIamPolicies:
      - Policy: arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
Scheduling:
  Scheduler: slurm
  SlurmQueues:
    - Name: queue0
      ComputeResources:
        - Name: queue0-c5xlarge
          MinCount: 0
          MaxCount: 5
          InstanceType: c5.xlarge
      Networking:
        SubnetIds:
          - subnet-abc123
Region: us-west-2
Image:
  Os: alinux2
```
**Note**
The region and subnet should be unique to your deployment

## Set Up
1. In the root directory at `ma-mono` run `rush install`
2. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder
3. Uncomment the `stage` attribute and provide the correct `<STAGE>` value for the attribute
4. Uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing.
5. Uncomment `rootUserEmail` and provide the main account user's email address
6. Uncomment `parallelClusterApiURL` and provide API endpoint to ParallelCluster API stack. Deployed in same region as its corresponding clusters. The url should not include the `https://` part. It should look something like this `<parallelClusterApiGwId>.execute-api.<region>.amazonaws.com`
7. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

Refer to [here](../../README.md#deploying-code) for additional deployment steps.

## Onboarding hosting account
Refer to [here](../../SETUP_v2p1.md#deploy-to-the-hosting-account) for instructions on how to add a hosting account to SWB.