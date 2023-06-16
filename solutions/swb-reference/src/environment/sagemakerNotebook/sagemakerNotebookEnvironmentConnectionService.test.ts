/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreatePresignedNotebookInstanceUrlCommand, SageMakerClient } from '@aws-sdk/client-sagemaker';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { mockClient } from 'aws-sdk-client-mock';
import SagemakerNotebookEnvironmentConnectionService from './sagemakerNotebookEnvironmentConnectionService';

describe('SagemakerNotebookEnvironmentConnectionService', () => {
  test('getAuthCreds should return mocked value', async () => {
    // BUILD
    const sm = new SagemakerNotebookEnvironmentConnectionService();
    const instanceName = 'instance-abc123';
    const sagemakerMock = mockClient(SageMakerClient);
    const url = 'authorized-url-123';
    sagemakerMock.on(CreatePresignedNotebookInstanceUrlCommand).resolvesOnce({
      AuthorizedUrl: url
    });

    const iamMock = mockClient(STSClient);
    iamMock.on(AssumeRoleCommand).resolvesOnce({
      Credentials: {
        AccessKeyId: 'sampleAccessKey',
        SecretAccessKey: 'sampleSecretAccessKey',
        SessionToken: 'sampleSessionToken',
        Expiration: new Date()
      }
    });

    // OPERATE & CHECK
    await expect(
      sm.getAuthCreds(instanceName, {
        roleArn: 'arn:aws:iam::<HOSTING-ACCOUNT-ID>:role/swb-dev-oh-env-mgmt',
        externalId: 'external-id-123'
      })
    ).resolves.toEqual({
      url
    });
  });

  test('getConnectionInstruction should return mocked value', async () => {
    const sm = new SagemakerNotebookEnvironmentConnectionService();
    await expect(sm.getConnectionInstruction()).resolves.toEqual(
      'To access Sagemaker Notebook, open #{"type":"link","hrefKey":"url","text":"Sagemaker URL"}'
    );
  });
});
