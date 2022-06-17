## Introduction

This folder contains the CDK construct, scripts and instructions to create a
3-member Hyperledger Fabric using Managed Blockchain. 

### Deployment
To deploy, first configure access to 3 AWS accounts locally using 3 profiles, then build the repository
with instructions in the main README file.

1. **Deploy to first account that creates the network.** In `cdk.json`, add the account number of the two 
additional AWS accounts in `additionalMembers`, build and deploy with `rushx build && rushx cdk:deploy --profile profile1`.
This deployment takes around 30mins. 
   (Note: If you have not deployed using CDK in this AWS account, run `rushx cdk:bootstrap` first)
2. **Deploy to the second account to join the network.** Once deployment to the first account finishes, navigate to 
the console of the second account. Review the invite to join the network in Managed Blockchain under invites. Copy the
networkId and inviteId into `cdk.json`. Build and deploy with `rushx build && rushx cdk:deploy --profile profile2`.
3. **Deploy to the third account following same approach as deploying to the second account.** 

### Test Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-97.7%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-90.62%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-96.15%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-97.58%25-brightgreen.svg?style=flat) |