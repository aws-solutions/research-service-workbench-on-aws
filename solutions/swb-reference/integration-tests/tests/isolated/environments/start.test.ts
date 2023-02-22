/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import { getProjectAdminRole, getResearcherRole } from '../../../../src/utils/roleUtils';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { dsUuidRegExp } from '../../../support/utils/regExpressions';
import Settings from '../../../support/utils/settings';
import { checkHttpError, getFakeEnvId } from '../../../support/utils/utilities';

describe('environment start negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const settings: Settings = setup.getSettings();
  const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('environment does not exist', async () => {
    const fakeEnvId = getFakeEnvId();
    try {
      await adminSession.resources.environments.environment(fakeEnvId).start();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find environment ${fakeEnvId}`
        })
      );
    }
  });

  test('project does not exist', async () => {
    const fakeEnvId = getFakeEnvId();
    const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
    try {
      await adminSession.resources.environments.environment(fakeEnvId, fakeProjectId).start();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find project ${fakeProjectId}`
        })
      );
    }
  });

  test('project was deleted', async () => {
    const dataSetName = randomTextGenerator.getFakeText('integration-test-dataSet');

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: `${dataSetName} cost center`,
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    const { data: createdProject } = await adminSession.resources.projects.create({
      name: `${dataSetName} project`,
      description: 'test description',
      costCenterId: costCenter.id
    });

    const projectId = createdProject.id;

    const dataSetBody = CreateDataSetRequestParser.parse({
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      path: dataSetName, // using same name to help potential troubleshooting
      name: dataSetName,
      region: settings.get('awsRegion'),
      owner: getProjectAdminRole(createdProject.id),
      ownerType: 'GROUP',
      type: 'internal',
      permissions: [
        {
          identity: getResearcherRole(createdProject.id),
          identityType: 'GROUP',
          accessLevel: 'read-only'
        }
      ]
    });

    const { data: dataSet } = await adminSession.resources.datasets.create(dataSetBody, false);
    expect(dataSet).toMatchObject({
      id: expect.stringMatching(dsUuidRegExp)
    });

    await adminSession.resources.projects.project(projectId).softDelete();

    const envBody = {
      envTypeId: settings.get('envTypeId'),
      envTypeConfigId: settings.get('envTypeConfigId'),
      envType: settings.get('envType'),
      datasetIds: [dataSet.id],
      name: randomTextGenerator.getFakeText('dataset-name'),
      projectId,
      description: 'Temporary DataSet for integration test'
    };

    try {
      await adminSession.resources.environments.create(envBody);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `Project ${projectId} was deleted`
        })
      );
    }
  });
});
