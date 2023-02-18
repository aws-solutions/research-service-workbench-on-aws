import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';

describe('sshKeys API multiStep integration test', () => {
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  // let pa2Session: ClientSession;
  let rs1Session: ClientSession;
  let project1Id: string;
  // let project2Id: string;

  beforeEach(async () => {
    ({
      adminSession,
      pa1Session,
      // pa2Session,
      rs1Session,
      project1Id
      // project2
    } = await paabHelper.createResources());
  });

  afterEach(async () => {
    await paabHelper.cleanup();
  });

  describe('happy path', () => {
    // zipping corresponding resources for testing
    const resources = [
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
    resources.forEach(({ userName, session, projectId }) => {
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

          expect(
            await session.resources.projects.project(projectId).sshKeys().sshKey(createdSshKey.id).delete()
          ).resolves;

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
});
