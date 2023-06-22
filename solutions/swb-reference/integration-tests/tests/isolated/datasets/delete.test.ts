import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import Settings from '../../../support/utils/settings';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets delete negative tests', () => {
  let pa1Session: ClientSession;
  let adminSession: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let paabHelper: PaabHelper;
  let setup: Setup;
  let settings: Settings;
  let dataSet1Id: string;

  beforeAll(async () => {
    setup = Setup.getSetup();
    paabHelper = new PaabHelper(1);
    settings = setup.getSettings();
    const paabResources = await paabHelper.createResources(__filename);
    project1Id = paabResources.project1Id;
    pa1Session = paabResources.pa1Session;
    adminSession = paabResources.adminSession;
    rs1Session = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
    const dataset1Name = randomTextGenerator.getFakeText('isolated-datasets-delete-ds1');
    const dataSetBody = CreateDataSetRequestParser.parse({
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      path: dataset1Name, // using same name to help potential troubleshooting
      name: dataset1Name,
      region: settings.get('awsRegion'),
      type: 'internal'
    });
    const { data: dataSet1 } = await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .create(dataSetBody, false);
    dataSet1Id = dataSet1.id;
  });

  beforeEach(() => {
    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
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

  describe('boundary tests', () => {
    test('ITAdmin should not be able to soft delete datasets', async () => {
      try {
        await adminSession.resources.datasets.dataset(dataSet1Id).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
    test('Researcher should not be able to soft delete datasets', async () => {
      try {
        await rs1Session.resources.projects.project(project1Id).dataSets().dataset(dataSet1Id).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    describe('user with no project', () => {
      beforeAll(async () => {
        //Remove researcher 1 from project 1 to make it a user with no project associated
        await adminSession.resources.projects
          .project(project1Id)
          .removeUserFromProject(rs1Session.getUserId()!);
      });
      afterAll(async () => {
        await adminSession.resources.projects
          .project(project1Id)
          .assignUserToProject(rs1Session.getUserId()!, {
            role: 'Researcher'
          });
      });

      test('User with no project cannot delete dataset', async () => {
        try {
          await rs1Session.resources.datasets.dataset(dataSet1Id).delete();
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(403, {
              error: 'User is not authorized'
            })
          );
        }
      });

      test('Unauthenticated user cannot delete dataset', async () => {
        try {
          await anonymousSession.resources.datasets.dataset(dataSet1Id).delete();
        } catch (e) {
          checkHttpError(e, new HttpError(403, {}));
        }
      });
    });
  });
});
