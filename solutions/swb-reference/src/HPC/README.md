# `AWS ParallelClusters API Backend on SWB`

## Requirements
The requirements utilizing the HPC backend on SWB:
1. Deploy Pcluster Manager stack and deploy clusters to Hosting Account. 
Instructions for deploying the stack can be found [here](https://pcluster.cloud/01-getting-started.html). Information on creating clusters are also here in [this video review of Pcluster Manager](https://www.youtube.com/watch?v=Z1vlpJYb1KQ).
2. Deploy ParallelCluster Stack API onto the Hosting Account under the region for where your clusters reside such as `us-east-1`. Use version `3.14` of [ParallelCluster Stack API](https://docs.aws.amazon.com/parallelcluster/latest/ug/api-reference-v3.html). For the parameters make sure to set CreateAPIUserRole to `false` to invoke the API from any IAM role, and as well specify the region for where the clusters reside such as `us-east-1`.
3. Create atleast one S3 bucket on your AWS Main Account containing files necessary to complete a job such as scripts and data. Add the `S3 Full Access` policy to the IAM role assumed by the head node of your cluster to have permission to execute S3 actions. Lastly, similar to the policy below, attach the appropriate bucket policy to your S3 bucket to allow your cluster head node to access the bucket.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::AWS-Hosting-Account-ID:Hosting-Cluster-InstanceProfileHeadNode-123456789"
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

## Set Up
1. In the root directory at `ma-mono` run `rush install`
2. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder
3. Uncomment the `stage` attribute and provide the correct `<STAGE>` value for the attribute
4. Uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing.
5. Uncomment `rootUserEmail` and provide the main account user's email address
6. Uncomment `parallelClusterApiURL` and provide API endpoint to ParallelCluster API stack. Deployed in same region as its corresponding clusters.
7. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

## Running Code Locally
If you have made changes to the `environment` package or the `swb-reference` package follow these steps
1. In `ma-mono` root directory run `rush build`
2. In `ma-mono/solutions/swb-reference` root directory run `STAGE=<STAGE TO RUN LOCALLY> ./scripts/runLocally.sh`. This will run a local lambda server.

## Deploying Code
Run one time to Bootstrap the CDK

`STAGE=<STAGE> rushx cdk bootstrap`

Deploy/Update code

`STAGE=<STAGE TO DEPLOY> rushx cdk-deploy`

## Run Post Deployment 
This step is necessary to setup Service Catalog portfolio and products

`STAGE=<STAGE> rushx run-postDeployment`

## Example Job Parameters

```
Job Name: test (can be any name)
Nodes: 1 (capped by max # of nodes on your worker queue)
Number of Tasks: 1 (how many times you want your job to be performed)
Queue: queue0 (name of a worker queue on your cluster)
S3 Bucket Data Folder URI: s3://my_bucket/my_test/ (a sub folder called output will be created)
Script Name: test.sh
```

## FAQ
1. **Why is there `jest.config.js` and `config/jest.config.json`?**
* `config/jest.config.json` is the settings for unit tests in the `src` folder
* `jest.config.js` is the settings for tests in `integration-tests`. These tests require setup steps that are not required by unit tests in the `src` folder.

2. **When I try to run the code locally or deploy the code, I'm getting dependency errors between the local packages.**

The `lib` folders for your project might have been deleted. Try running `rush purge; rush build` in the root 
directory of this project to build the `lib` folders from scratch. 

3. **How do I see which line of code my unit tests did not cover?**

Run `rushx jest --coverage`

4. **Why am I'm getting the error "Cannot find module in `common/temp`"?**

Your `node_modules`  might have been corrupted. Try the following command
```
rush purge
rush install
rush build
```
