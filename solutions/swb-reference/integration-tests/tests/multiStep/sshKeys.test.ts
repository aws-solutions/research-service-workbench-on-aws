import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';

describe('sshKeys API multiStep integration test', () => {
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let rs1Session: ClientSession;
  let project1Id: string;
  // let project2Id: string;

  beforeEach(async () => {
    ({
      adminSession,
      pa1Session,
      pa2Session,
      rs1Session,
      project1Id
      // project2Id
    } = await paabHelper.createResources());
  });

  afterEach(async () => {
    await paabHelper.cleanup();
  });

  describe('happy path', () => {
    // zipping corresponding resources for testing
    const testBundle = [
      {
        userName: 'projectAdmin1',
        session: pa1Session,
        projectId: project1Id
      },
      {
        userName: 'researcher1',
        session: rs1Session,
        projectId: project1Id
      }
    ];

    // create test case for each zipped resources
    testBundle.forEach(({ userName, session, projectId }) => {
      describe(`iterate over aligned resources`, () => {
        test(`test of for ${userName}`, async () => {
          console.log('creating a key');
          const { data: createdSshKey } = await session.resources.projects
            .project(projectId)
            .sshKeys()
            .create();

          console.log('retrieving the key by listUserKeysForProject');
          const { data: listedSshKey } = await session.resources.projects.project(projectId).sshKeys().get();
          expect(listedSshKey.sshKeys.length).toEqual(1);
          expect(listedSshKey.sshKeys[0].sskKeyId).toEqual(createdSshKey.id);

          console.log('deleting the key');

          await session.resources.projects.project(projectId).sshKeys().sshKey(createdSshKey.id).delete();
          // expect(
          //   await session.resources.projects.project(projectId).sshKeys().sshKey(createdSshKey.id).delete()
          // ).resolves;

          console.log('retrieving the key does not return deleted key');
          const { data: listedSshKeyAfterDelete } = await session.resources.projects
            .project(projectId)
            .sshKeys()
            .get();
          expect(listedSshKeyAfterDelete.sshKeys.length).toEqual(0);
        });
      });
    });
  });

  describe('negative test', () => {
    // zipping corresponding resources for testing
    const testBundle = [
      {
        userName1: 'projectAdmin1',
        userName2: 'researcher1',
        session1: pa1Session,
        session2: rs1Session,
        project1Id: project1Id
      },
      {
        userName1: 'projectAdmin1',
        userName2: 'researcher1',
        session1: pa1Session,
        session2: rs1Session,
        project1Id: project1Id
      },
      {
        userName1: 'researcher1',
        userName2: 'projectAdmin1',
        session1: rs1Session,
        session2: pa1Session,
        project1Id: project1Id
      }
    ];

    // create test case for each zipped resources
    testBundle.forEach(({ userName1, userName2, session1, session2, project1Id }) => {
      describe(`iterate over misaligned resources`, () => {
        test(`test of for ${userName1}, ${userName2}`, async () => {
          console.log(`${userName1} creating a key`);
          const { data: createdSshKey } = await session1.resources.projects
            .project(project1Id)
            .sshKeys()
            .create();

          console.log(`${userName2} fails to retrieve ${userName1}'s key by listUserSshKeysForProject`);
          try {
            await session2.resources.projects.project(project1Id).sshKeys().get(); // NEED TO CONFIRM it's from collectionResources
          } catch (e) {
            checkHttpError(
              e,
              new HttpError(403, {
                error: 'User is not authorized' //User does not have access
              })
            );
          }

          console.log(`${userName2} fails to delete the ${userName1}'s key`);
          try {
            await session2.resources.projects.project(project1Id).sshKeys().sshKey(createdSshKey.id).delete();
          } catch (e) {
            checkHttpError(
              e,
              new HttpError(403, {
                error: 'User is not authorized' //User does not have access
              })
            );
          }
        });
      });
    });
  });
});
