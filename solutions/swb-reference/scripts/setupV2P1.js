#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// To use the script, follow the example below
// STAGE=<STAGE> node setupV2P1.js <userName> '<password>'

const { join } = require('path');
const fs = require('fs');
const { httpApiPost } = require('./apiHelper');
const { AwsService, CognitoTokenService } = require('@aws/workbench-core-base');

const readFromStageOutput = JSON.parse(
  // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
  // correct file
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFileSync(join(__dirname, `../src/config/${process.env.STAGE}.js`), 'utf8') // nosemgrep
);

const stackName = Object.keys(readFromStageOutput)[0];
const deploymentOutput = readFromStageOutput[stackName];

const hosting_accounts = JSON.parse(
  // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
  // correct file
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFileSync(join(__dirname, `../src/config/${process.env.STAGE}_hosting_accounts.json`), 'utf8') // nosemgrep
);

const clientId = deploymentOutput.cognitoUserPoolClientId;
const userPoolId = deploymentOutput.cognitoUserPoolId;
const region = deploymentOutput.awsRegion;
const username = process.argv[2];
const password = process.argv[3];
const awsService = new AwsService({ region });

async function getTokens() {
  const cognitoTokenService = new CognitoTokenService(region);
  return await cognitoTokenService.generateCognitoToken(userPoolId, clientId, username, undefined, password);
}

async function createFirstProject() {
  for (let i = 0; i < hosting_accounts.length; i++) {
    await awsService.clients.ddb.putItem({
      TableName: stackName,
      Item: {
        pk: { S: 'PROJ#cf3019e3-88d5-4a64-9025-26a177e36f59' },
        sk: { S: 'PROJ#cf3019e3-88d5-4a64-9025-26a177e36f59' },
        id: { S: 'cf3019e3-88d5-4a64-9025-26a177e36f59' },
        accountId: { S: 'acc-123' },
        indexId: { S: 'index-123' },
        description: { S: 'Example project 1' },
        owner: { S: 'abc' },
        projectAdmins: { L: [] },
        resourceType: { S: 'project' },
        name: { S: 'Project 1' },
        envMgmtRoleArn: { S: hosting_accounts[i].envMgmtRoleArn },
        hostingAccountHandlerRoleArn: { S: hosting_accounts[i].hostingAccountHandlerRoleArn },
        encryptionKeyArn: { S: hosting_accounts[i].encryptionKeyArn },
        subnetId: { S: hosting_accounts[i].subnetId },
        vpcId: { S: hosting_accounts[i].vpcId },
        externalId: { S: 'workbench' },
        environmentInstanceFiles: { S: hosting_accounts[i].environmentInstanceFiles },
        awsAccountId: { S: hosting_accounts[i].awsAccountId },
        createdAt: { S: '2022-01-28T22:42:20.296Z' },
        createdBy: { S: 'abc' },
        updatedAt: { S: '2022-02-02T21:07:30.237Z' },
        updatedBy: { S: 'abc' }
      }
    });
  }
}

async function getProductInfo() {
  const portfolioId = await awsService.helpers.serviceCatalog.getPortfolioId(stackName);

  const productInfo = await awsService.clients.serviceCatalog.describeProductAsAdmin({
    SourcePortfolioId: portfolioId,
    Name: 'sagemakerNotebook'
  });

  const productId = productInfo.ProductViewDetail.ProductViewSummary.ProductId;

  const provisioningArtifactId = productInfo.ProvisioningArtifactSummaries[0].Id;

  return { productId, provisioningArtifactId };
}

async function createFirstEnvType(tokens, productId, provisioningArtifactId) {
  const createEnvType = {
    status: 'APPROVED',
    name: 'Sagemaker Jupyter Notebook',
    productId: productId,
    provisioningArtifactId: provisioningArtifactId,
    allowedRoleIds: [],
    params: [
      {
        DefaultValue: 'ml.t3.xlarge',
        IsNoEcho: false,
        ParameterConstraints: {
          AllowedValues: []
        },
        ParameterType: 'String',
        Description: 'EC2 instance type to launch',
        ParameterKey: 'InstanceType'
      },
      {
        IsNoEcho: false,
        ParameterConstraints: {
          AllowedValues: []
        },
        ParameterType: 'Number',
        Description: 'Number of idle minutes for auto stop to shutdown the instance (0 to disable auto-stop)',
        ParameterKey: 'AutoStopIdleTimeInMinutes'
      },
      {
        IsNoEcho: false,
        ParameterConstraints: {
          AllowedValues: []
        },
        ParameterType: 'String',
        Description: 'The IAM policy to be associated with the launched workstation',
        ParameterKey: 'IamPolicyDocument'
      },
      {
        DefaultValue: '1.1.1.1/1',
        IsNoEcho: false,
        ParameterConstraints: {
          AllowedValues: []
        },
        ParameterType: 'String',
        Description: 'CIDR to restrict IPs that can access the environment',
        ParameterKey: 'CIDR'
      }
    ],
    description: 'An Amazon SageMaker Jupyter Notebook',
    type: 'sagemakerNotebook'
  };

  const createEnvTypeResponse = await httpApiPost(
    tokens.accessToken,
    deploymentOutput.apiUrlOutput,
    '/environmentTypes',
    createEnvType
  );

  return createEnvTypeResponse.id;
}

async function createFirstEnvTypeConfig(tokens, createEnvTypeId) {
  const createEnvTypeConfig = {
    type: 'sagemakerNotebook',
    description: 'Description for config 1',
    name: 'Config 1',
    allowedRoleIds: [],
    params: [
      {
        key: 'IamPolicyDocument',
        value: '${iamPolicyDocument}'
      },
      {
        key: 'InstanceType',
        value: 'ml.t3.medium'
      },
      {
        key: 'AutoStopIdleTimeInMinutes',
        value: '0'
      },
      {
        key: 'CIDR',
        value: '0.0.0.0/0'
      }
    ]
  };

  await httpApiPost(
    tokens.accessToken,
    deploymentOutput.apiUrlOutput,
    `/environmentTypes/${createEnvTypeId}/configurations`,
    createEnvTypeConfig
  );
}

async function createHostingAccounts(tokens) {
  for (let i = 0; i < hosting_accounts.length; i++) {
    const aws_accounts = {
      awsAccountId: hosting_accounts[i].awsAccountId,
      envMgmtRoleArn: hosting_accounts[i].envMgmtRoleArn,
      hostingAccountHandlerRoleArn: hosting_accounts[i].hostingAccountHandlerRoleArn,
      externalId: 'workbench',
      encryptionKeyArn: hosting_accounts[i].encryptionKeyArn,
      environmentInstanceFiles: hosting_accounts[i].environmentInstanceFiles
    };
    await httpApiPost(tokens.accessToken, deploymentOutput.apiUrlOutput, `/aws-accounts`, aws_accounts);
  }
}

async function createFirstDataset(tokens) {
  const regex = /\d{12}/g;

  const mainAccountId = deploymentOutput.ApiLambdaRoleOutput.match(regex)[0];

  const createDataset = {
    datasetName: 'testDs',
    storageName: deploymentOutput.DataSetsBucketName,
    path: 'testFolder',
    awsAccountId: mainAccountId
  };

  await httpApiPost(tokens.accessToken, deploymentOutput.apiUrlOutput, `/datasets`, createDataset);
}

async function run() {
  try {
    const tokens = await getTokens();
    await createFirstProject();
    const { productId, provisioningArtifactId } = await getProductInfo();
    const createEnvTypeId = await createFirstEnvType(tokens, productId, provisioningArtifactId);
    await createFirstEnvTypeConfig(tokens, createEnvTypeId);
    await createHostingAccounts(tokens);
    await createFirstDataset(tokens);
  } catch (e) {
    console.error('Error occured during deployment: ', e);
  }
}

(async () => {
  await run();
})();
