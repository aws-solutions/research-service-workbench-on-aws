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
Region: us-east-1
Image:
  Os: alinux2
```
5. Create atleast one S3 bucket on your AWS Main Account containing files necessary to complete a job such as scripts and data. Similar to the policy below, attach the appropriate bucket policy to your S3 bucket to allow your ParallelCluster to access the bucket. Lastly, within your AWS Hosting Account attach the `S3 Full Access` policy to both the IAM role of the head node (prefix of `<clusterName>-RoleHeadNode`) and the IAM role of the compute nodes (prefix of `<clusterName>-Role`) of your ParallelCluster for the nodes to execute S3 operations.
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::AWS-Hosting-Account-ID:role/parallelcluster/*/*"
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::main-account-bucket",
                "arn:aws:s3:::main-account-bucket/*"
            ]
        }
    ]
}
```

**Note**
The region and subnet should be unique to your deployment.

## Set Up
1. In the root directory at `ma-mono` run `rush install`
2. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder
3. Uncomment the `stage` attribute and provide the correct `<STAGE>` value for the attribute
4. Uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing.
5. Uncomment `rootUserEmail` and provide the main account user's email address
6. Uncomment `parallelClusterApiURL` and provide API endpoint to ParallelCluster API stack. Deployed in same region as its corresponding clusters. The url should not include the `https://` part. It should look something like this `<parallelClusterApiGwId>.execute-api.<region>.amazonaws.com`
7. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

Refer to [here](../../README.md#deploying-code) for additional deployment steps.


## Example Job Parameters

```
Job Name: test (can be any name)
Nodes: 1 (capped by max # of nodes on your worker queue)
Number of Tasks: 1 (how many times you want your job to be performed)
Queue: queue0 (name of a worker queue on your cluster)
S3 Bucket Data Folder URI: s3://my_bucket/my_test/ (final backslash is required, and sub output folder will be created)
Script Name: test.sh
```
A test job is provided in `./HPC/artifacts/test_job` which can be uploaded to your S3 bucket. Make sure that the S3 folder name is `test_job` and to update the last `aws s3 cp` command with the proper S3 URI (bucket name and folder location of `test_job`).

## Onboarding hosting account
Refer to [here](../../SETUP_v2p1.md#deploy-to-the-hosting-account) for instructions on how to add a hosting account to SWB.
