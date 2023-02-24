/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list environment type configs', () => {
  const setup: Setup = new Setup();
  const envTypeId = setup.getSettings().get('envTypeId');
  const paabHelper: PaabHelper = new PaabHelper();
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let projectId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    projectId = paabResources.project1Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('ITAdmin tests', () => {
    test('list environments type configs excecutes successfully', async () => {
      const { data: response } = await itAdminSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .get({});
      expect(Array.isArray(response.data)).toBe(true);
    });

    // TODO: Update this test once input validation is added
    // test('list environments type configs fails when using invalid format envType Id', async () => {
    //   try {
    //     await itAdminSession.resources.environmentTypes
    //       .environmentType('invalid-envType-id')
    //       .configurations()
    //       .get({});
    //   } catch (e) {
    //     checkHttpError(
    //       e,
    //       new HttpError(400, {
    //         error: 'Bad Request',
    //         message: ''
    //       })
    //     );
    //   }
    // });
  });

  describe('Project Admin tests', () => {
    test('list environments type configs excecutes successfully', async () => {
      const { data: response } = await paSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get({});
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('list environments type configs fails when using invalid format envType Id', async () => {
      try {
        await paSession.resources.environmentTypes
          .environmentType('invalid-envType-id')
          .configurations()
          .get({});
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

  describe('Researcher tests', () => {
    test('list environments type configs excecutes successfully', async () => {
      const { data: response } = await researcherSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get({});
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('list environments type configs fails when using invalid format envType Id', async () => {
      try {
        await researcherSession.resources.environmentTypes
          .environmentType('invalid-envType-id')
          .configurations()
          .get({});
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
