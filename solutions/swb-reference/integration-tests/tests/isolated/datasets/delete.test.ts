import { DataSet } from '@aws/swb-app';
import {
  CreateDataSetRequest,
  CreateDataSetRequestParser
} from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import { getProjectAdminRole, getResearcherRole } from '../../../../src/utils/roleUtils';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { dsUuidRegExp } from '../../../support/utils/regExpressions';
import Settings from '../../../support/utils/settings';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets delete negative tests', () => {
  const setup: Setup = new Setup();
  const settings: Settings = setup.getSettings();
  let adminSession: ClientSession;
  let dataSet: DataSet;
  let dataSetBody: CreateDataSetRequest;
  let projectId: string;
  let costCenterId: string;
  const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
  let dataSetName: string;

  beforeEach(async () => {
    adminSession = await setup.getDefaultAdminSession();
    dataSetName = randomTextGenerator.getFakeText('integration-test-dataSet');

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: `${dataSetName} cost center`,
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    costCenterId = costCenter.id;

    const { data: createdProject } = await adminSession.resources.projects.create({
      name: `${dataSetName} project`,
      description: 'test description',
      costCenterId
    });

    projectId = createdProject.id;

    dataSetBody = CreateDataSetRequestParser.parse({
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

    const { data: newDataSet } = await adminSession.resources.datasets.create(dataSetBody, false);
    expect(newDataSet).toMatchObject({
      id: expect.stringMatching(dsUuidRegExp)
    });

    dataSet = newDataSet;
  });

  describe('when the dataset does not exist', () => {
    test('it returns a 404', async () => {
      try {
        await adminSession.resources.datasets
          .dataset('dataset-00000000-0000-0000-0000-000000000000')
          .deleteFromProject(projectId);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Not Found`
          })
        );
      }
    });
  });

  describe('when the dataset is still associated with', () => {
    describe('external endpoints', () => {
      beforeEach(async () => {
        const envBody = {
          envTypeId: settings.get('envTypeId'),
          envTypeConfigId: settings.get('envTypeConfigId'),
          envType: settings.get('envType'),
          datasetIds: [dataSet.id],
          name: randomTextGenerator.getFakeText('dataset-name'),
          projectId,
          description: 'Temporary DataSet for integration test'
        };
        const { data: env } = await adminSession.resources.environments.create(envBody);

        const { data: envDetails } = await adminSession.resources.environments
          .environment(env.id, projectId)
          .get();
        const awsRegion = settings.get('awsRegion');
        const mainAccountId = settings.get('mainAccountId');
        const accessPointName = `${dataSet.id!.slice(0, 13)}-mounted-on-${env.id.slice(0, 12)}`;
        expect(envDetails).toMatchObject({
          ENDPOINTS: expect.arrayContaining([
            expect.objectContaining({
              endPointUrl: `s3://arn:aws:s3:${awsRegion}:${mainAccountId}:accesspoint/${accessPointName}`,
              storageArn: `arn:aws:s3:::${settings.get('DataSetsBucketName')}`,
              dataSetId: dataSet.id,
              path: dataSetName
            })
          ]),
          DATASETS: expect.arrayContaining([
            expect.objectContaining({
              id: dataSet.id,
              name: dataSetName
            })
          ])
        });

        const { data: dataSetDetails } = await adminSession.resources.datasets.dataset(dataSet.id!).get();
        expect(dataSetDetails).toMatchObject({
          ...dataSetBody,
          externalEndpoints: [envDetails.ENDPOINTS[0].sk.split('ENDPOINT#')[1]]
        });
      });

      test('it returns a 409', async () => {
        try {
          await adminSession.resources.datasets.dataset(dataSet.id!).deleteFromProject(projectId);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(409, {
              error: 'Conflict',
              message: `External endpoints found on Dataset must be removed before DataSet can be removed.`
            })
          );
        }
      });
    });

    describe('projects other than the datasets owning project', () => {
      let associatedProjectId: string;
      beforeEach(async () => {
        const { data: project } = await adminSession.resources.projects.create({
          name: `${dataSet.name} unassociated project`,
          description: 'test description',
          costCenterId
        });
        await adminSession.resources.datasets
          .dataset(dataSet.id!)
          .associateWithProject(project.id, 'read-only');

        associatedProjectId = project.id;
      });

      test('it returns a 409', async () => {
        try {
          await adminSession.resources.datasets.dataset(dataSet.id!).deleteFromProject(projectId);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(409, {
              error: 'Conflict',
              message: `DataSet ${dataSet.id} cannot be removed because it is associated with project(s) ['${associatedProjectId}']`
            })
          );
        }
      });
    });
  });
});
