import { DataSet } from '@aws/swb-app';
import {
  CreateDataSetRequest,
  CreateDataSetRequestParser
} from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import Settings from '../../../support/utils/settings';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets delete negative tests', () => {
  const setup: Setup = Setup.getSetup();
  const settings: Settings = setup.getSettings();
  let pa1Session: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let paabHelper: PaabHelper;
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
    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('when the dataset does not exist', () => {
    test('it returns a 403', async () => {
      try {
        await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .dataset('dataset-00000000-0000-0000-0000-000000000000')
          .delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
  });

  describe('When the project does not exist', () => {
    test('It returns a 403', async () => {
      try {
        await pa1Session.resources.projects
          .project('proj-00000000-0000-0000-0000-000000000000')
          .dataSets()
          .dataset('dataset-00000000-0000-0000-0000-000000000000')
          .delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
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
        type: 'internal'
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
          description: 'Temporary DataSet for integration test'
        };
        const { data: env } = await pa1Session.resources.projects
          .project(project1Id)
          .environments()
          .create(envBody);

        const { data: envDetails } = await pa1Session.resources.projects
          .project(project1Id)
          .environments()
          .environment(env.id)
          .get();
        console.log('got environment');
        expect(envDetails).toMatchObject({
          ENDPOINTS: expect.arrayContaining([
            expect.objectContaining({
              dataSetId: dataSet.id
            })
          ]),
          DATASETS: expect.arrayContaining([
            expect.objectContaining({
              id: dataSet.id
            })
          ])
        });

        const { data: dataSetDetails } = await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .dataset(dataSet.id!)
          .get();
        expect(dataSetDetails).toMatchObject({
          ...dataSetBody
        });
      });

      test('it returns a 409', async () => {
        try {
          await pa1Session.resources.projects.project(project1Id).dataSets().dataset(dataSet.id!).delete();
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
          await pa1Session.resources.projects.project(project1Id).dataSets().dataset(dataSet.id!).delete();
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(409, {
              error: 'Conflict',
              message: `DataSet ${dataSet.id} cannot be removed because it is still associated with roles in the following project(s) ['${associatedProjectId}']`
            })
          );
        }
      });
    });
  });
});
