/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, getFakeEnvId } from '../../../support/utils/utilities';

describe('environment start negative tests', () => {
  const paabHelper = new PaabHelper();
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let projectId: string;
  let researcherSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    projectId = paabResources.project1Id;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('ITAdmin tests', () => {
    test('environment does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      try {
        await itAdminSession.resources.projects
          .project(projectId)
          .environments()
          .environment(fakeEnvId)
          .start();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Could not find environment ${fakeEnvId}`
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
          .start();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Could not find project ${fakeProjectId}`
          })
        );
      }
    });
  });

  describe('Project Admin tests', () => {
    test('environment does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      try {
        await paSession.resources.projects.project(projectId).environments().environment(fakeEnvId).start();
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
          .start();
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
    test('environment does not exist', async () => {
      const fakeEnvId = getFakeEnvId();
      try {
        await researcherSession.resources.projects
          .project(projectId)
          .environments()
          .environment(fakeEnvId)
          .start();
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
          .start();
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
