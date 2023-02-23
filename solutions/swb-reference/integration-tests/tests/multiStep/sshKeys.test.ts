import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';

describe('sshKeys API multiStep integration test', () => {
  const paabHelper = new PaabHelper();
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let project1Id: string;

  beforeEach(async () => {
    const resources = await paabHelper.createResources();
    ({ pa1Session, rs1Session, project1Id } = resources);
  });

  afterEach(async () => {
    await paabHelper.cleanup();
  });

  describe('happy path', () => {
    const testBundle = [
      {
        session: () => pa1Session,
        userName: 'projectAdmin1',
        projectId: () => project1Id
      },
      {
        session: () => rs1Session,
        userName: 'researcher1',
        projectId: () => project1Id
      }
    ];

    test.each(testBundle)('for each session', async (testCase) => {
      const { session: sessionFunc, userName, projectId: projectIdFunc } = testCase;
      const session = sessionFunc();
      const projectId = projectIdFunc();

      console.log(`Running happy path as ${userName}`);

      console.log('creating a key');
      const { data: createdSshKey } = await session.resources.projects.project(projectId).sshKeys().create();

      console.log('retrieving the key by listUserKeysForProject');
      const { data: listedSshKey } = await session.resources.projects.project(projectId).sshKeys().get();
      expect(listedSshKey.sshKeys.length).toEqual(1);
      expect(listedSshKey.sshKeys[0].sshKeyId).toEqual(createdSshKey.id);

      console.log('deleting the key');
      await session.resources.projects.project(projectId).sshKeys().sshKey(createdSshKey.id).delete();

      console.log('retrieving the key does not return deleted key');
      const { data: listedSshKeyAfterDelete } = await session.resources.projects
        .project(projectId)
        .sshKeys()
        .get();
      expect(listedSshKeyAfterDelete.sshKeys.length).toEqual(0);
    });
  });

  describe('negative test', () => {
    // zipping corresponding resources for testing
    const testBundle = [
      {
        userName1: 'projectAdmin1',
        userName2: 'researcher1',
        session1: () => pa1Session,
        session2: () => rs1Session,
        projectId: () => project1Id
      },
      {
        userName1: 'researcher1',
        userName2: 'projectAdmin1',
        session1: () => rs1Session,
        session2: () => pa1Session,
        projectId: () => project1Id
      }
    ];

    test.each(testBundle)('within project boundary', async (testCase) => {
      const {
        userName1,
        userName2,
        session1: session1func,
        session2: session2Func,
        projectId: projectIdFunc
      } = testCase;
      const session1 = session1func();
      const session2 = session2Func();
      const projectId = projectIdFunc();

      console.log(`${userName2} cannot manage ${userName1}'s key within ${projectId}`);

      console.log(`${userName1} creating a key`);
      const { data: createdSshKey } = await session1.resources.projects.project(projectId).sshKeys().create();

      console.log(`${userName2} fails to retrieve ${userName1}'s key by listUserSshKeysForProject`);
      const { data: listedSshKeyAfterDelete } = await session2.resources.projects
        .project(projectId)
        .sshKeys()
        .get();
      expect(listedSshKeyAfterDelete.sshKeys.length).toEqual(0);

      console.log(`${userName2} fails to delete the ${userName1}'s key`);
      try {
        await session2.resources.projects.project(projectId).sshKeys().sshKey(createdSshKey.id).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'Forbidden',
            message: `Current user ${session2.getUserId()} cannot delete a key they do not own`
          })
        );
      }
    });
  });
});