import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import Settings from '../../../support/utils/settings';
import { checkHttpError } from '../../../support/utils/utilities';

describe('negative tests for associating datasets with project', () => {
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let paabHelper: PaabHelper;
  let adminSession: ClientSession;
  let setup: Setup;
  let settings: Settings;
  let dataSet1Id: string;

  beforeAll(async () => {
    paabHelper = new PaabHelper(2);
    setup = Setup.getSetup();
    settings = setup.getSettings();
    const paabResources = await paabHelper.createResources(__filename);
    project1Id = paabResources.project1Id;
    project2Id = paabResources.project2Id;
    pa1Session = paabResources.pa1Session;
    pa2Session = paabResources.pa2Session;
    rs1Session = paabResources.rs1Session;
    adminSession = paabResources.adminSession;
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

  test('ITAdmin does not have the permissions to associate a dataset to a project', async () => {
    try {
      await adminSession.resources.datasets.dataset(dataSet1Id).associateWithProject(project2Id, 'read-only');
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('ProjectAdmin cannot associate a dataset that they do not own', async () => {
    try {
      await pa2Session.resources.projects
        .project(project2Id)
        .dataSets()
        .dataset(dataSet1Id)
        .associateWithProject(project2Id, 'read-write');
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('Researcher cannot associate a dataset to a separate project', async () => {
    try {
      await rs1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .dataset(dataSet1Id)
        .associateWithProject(project2Id, 'read-write');
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
      await adminSession.resources.projects.project(project1Id).assignUserToProject(rs1Session.getUserId()!, {
        role: 'Researcher'
      });
    });

    test('User with no project cannot associate any dataset to any project', async () => {
      try {
        await rs1Session.resources.datasets
          .dataset(dataSet1Id)
          .associateWithProject(project2Id, 'read-write');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('Unauthenticated user cannot associate any dataset to any project', async () => {
      try {
        await anonymousSession.resources.datasets
          .dataset(dataSet1Id)
          .associateWithProject(project2Id, 'read-write');
      } catch (e) {
        checkHttpError(e, new HttpError(403, {}));
      }
    });
  });
});
