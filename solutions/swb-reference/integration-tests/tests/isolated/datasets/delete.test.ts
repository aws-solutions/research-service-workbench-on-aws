import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets delete negative tests', () => {
  let pa1Session: ClientSession;
  let project1Id: string;
  let paabHelper: PaabHelper;

  beforeAll(async () => {
    paabHelper = new PaabHelper(1);
    const paabResources = await paabHelper.createResources();
    project1Id = paabResources.project1Id;
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
});
