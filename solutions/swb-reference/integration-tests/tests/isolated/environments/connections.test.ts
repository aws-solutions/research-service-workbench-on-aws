/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, getFakeEnvId } from '../../../support/utils/utilities';

describe('environments connection negative tests', () => {
  const paabHelper: PaabHelper = new PaabHelper(2);
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let project2Id: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    project1Id = paabResources.project1Id;
    project2Id = paabResources.project2Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('itAdmin tests', () => {
    test('environment does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      try {
        await itAdminSession.resources.projects
          .project(project1Id)
          .environments()
          .environment(fakeEnvId)
          .connect();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('project does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
      try {
        await itAdminSession.resources.projects
          .project(fakeProjectId)
          .environments()
          .environment(fakeEnvId)
          .connect();
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

  describe('projectAdmin tests', () => {
    test('environment does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      try {
        await paSession.resources.projects
          .project(project1Id)
          .environments()
          .environment(fakeEnvId)
          .connect();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('project does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
      try {
        await paSession.resources.projects
          .project(fakeProjectId)
          .environments()
          .environment(fakeEnvId)
          .connect();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('projectAdmin not assigned to project', async () => {
      const fakeEnvId = getFakeEnvId();
      try {
        await paSession.resources.projects
          .project(project2Id)
          .environments()
          .environment(fakeEnvId)
          .connect();
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

  describe('researcher tests', () => {
    test('environment does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      try {
        await researcherSession.resources.projects
          .project(project1Id)
          .environments()
          .environment(fakeEnvId)
          .connect();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('project does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
      try {
        await researcherSession.resources.projects
          .project(fakeProjectId)
          .environments()
          .environment(fakeEnvId)
          .connect();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('researcher not assigned to project', async () => {
      const fakeEnvId = getFakeEnvId();
      try {
        await researcherSession.resources.projects
          .project(project2Id)
          .environments()
          .environment(fakeEnvId)
          .connect();
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

  test('Unauthenticated user cannot connect to environment', async () => {
    const fakeEnvId = getFakeEnvId();

    try {
      await anonymousSession.resources.projects
        .project(project1Id)
        .environments()
        .environment(fakeEnvId)
        .connect();
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });
});
