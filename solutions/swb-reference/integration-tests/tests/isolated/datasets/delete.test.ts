import { DataSet } from '@aws/swb-app';
import {
  CreateDataSetRequest,
  CreateDataSetRequestParser
} from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import { getResearcherRole } from '../../../../src/utils/roleUtils';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import Settings from '../../../support/utils/settings';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets delete negative tests', () => {
  const setup: Setup = new Setup();
  const settings: Settings = setup.getSettings();
  let pa1Session: ClientSession;
  // let pa2Session: ClientSession;
  // let researcher1Sesssion: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let paabHelper: PaabHelper;
  // let adminSession: ClientSession
  let dataSet: DataSet;
  let dataSetBody: CreateDataSetRequest;
  const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
  let dataSetName: string;

  beforeAll(async () => {
    paabHelper = new PaabHelper();
    const paabResources = await paabHelper.createResources();
    project1Id = paabResources.project1Id;
    project2Id = paabResources.project2Id;
    pa1Session = paabResources.pa1Session;
    // pa2Session = paabResources.pa2Session;
    // researcher1Sesssion = paabResources.rs1Session;
    // adminSession = paabResources.adminSession;

    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('when the dataset does not exist', () => {
    test('it returns a 404', async () => {
      try {
        await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .dataset('dataset-00000000-0000-0000-0000-000000000000')
          .softDelete();
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
    beforeEach(async () => {
      dataSetName = randomTextGenerator.getFakeText('integration-test-dataSet');

      dataSetBody = CreateDataSetRequestParser.parse({
        storageName: settings.get('DataSetsBucketName'),
        awsAccountId: settings.get('mainAccountId'),
        path: dataSetName,
        name: dataSetName,
        region: settings.get('awsRegion'),
        type: 'internal',
        permissions: [
          {
            identity: getResearcherRole(project1Id),
            identityType: 'GROUP',
            accessLevel: 'read-only'
          }
        ]
      });

      const { data: newDataSet } = await pa1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .create(dataSetBody, false);
      dataSet = newDataSet;
    });

    describe('external endpoints', () => {
      beforeEach(async () => {
        const envBody = {
          envTypeId: settings.get('envTypeId'),
          envTypeConfigId: settings.get('envTypeConfigId'),
          envType: settings.get('envType'),
          datasetIds: [dataSet.id],
          name: randomTextGenerator.getFakeText('dataset-name'),
          projectId: project1Id,
          description: 'Temporary DataSet for integration test'
        };
        const { data: env } = await pa1Session.resources.environments.create(envBody);
        console.log('created environment');
        const { data: envDetails } = await pa1Session.resources.environments
          .environment(env.id, project1Id)
          .get();
        console.log('got environment');
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

        const { data: dataSetDetails } = await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .dataset(dataSet.id!)
          .get();
        expect(dataSetDetails).toMatchObject({
          ...dataSetBody,
          externalEndpoints: [envDetails.ENDPOINTS[0].sk.split('ENDPOINT#')[1]]
        });
      });

      test('it returns a 409', async () => {
        try {
          await pa1Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(dataSet.id!)
            .deleteFromProject(project1Id);
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
        await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .dataset(dataSet.id!)
          .associateWithProject(project2Id, 'read-only');
        associatedProjectId = project2Id;
      });

      test('it returns a 409', async () => {
        try {
          await pa1Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(dataSet.id!)
            .softDelete();
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
