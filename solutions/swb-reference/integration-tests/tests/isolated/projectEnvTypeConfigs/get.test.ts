/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { getProjectAdminRole, getResearcherRole } from '../../../../src/utils/roleUtils';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get EnvTypeConfig with Project route', () => {
  const paabHelper: PaabHelper = new PaabHelper();
  const setup: Setup = Setup.getSetup();
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  const nonExistentProjectId = 'proj-12345678-1234-1234-1234-123456789012';
  const nonExistentEnvTypeId = 'et-prod-0123456789012,pa-0123456789012';
  const nonExistentEnvTypeConfigId = 'etc-12345678-1234-1234-1234-123456789012';
  let projectId1: string;
  let projectId2: string;
  let itAdminSession: ClientSession;
  let pa1Session: ClientSession;
  let researcherSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    itAdminSession = paabResources.adminSession;

    pa1Session = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    projectId1 = paabResources.project1Id;
    projectId2 = paabResources.project2Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('IT Admin tests', () => {
    test('fails when using invalid format project Id', async () => {
      try {
        await itAdminSession.resources.projects
          .project('invalid-project-id')
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `projectId: Invalid ID`
          })
        );
      }
    });

    test('fails when using non existing project Id', async () => {
      try {
        await itAdminSession.resources.projects
          .project(nonExistentProjectId)
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: 'Resource not found'
          })
        );
      }
    });

    test('fails when using invalid format envType Id', async () => {
      try {
        await itAdminSession.resources.projects
          .project(projectId1)
          .environmentTypes()
          .environmentType('invalid-envType-id')
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `envTypeId: Invalid ID`
          })
        );
      }
    });

    test('fails when using non existing envType Id', async () => {
      try {
        await itAdminSession.resources.projects
          .project(projectId1)
          .environmentTypes()
          .environmentType(nonExistentEnvTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: 'Resource not found'
          })
        );
      }
    });

    test('fails when using invalid format envTypeConfig Id', async () => {
      try {
        await itAdminSession.resources.projects
          .project(projectId1)
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig('invalid-etc-id')
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `envTypeConfigId: Invalid ID`
          })
        );
      }
    });

    test('fails when using non existing envTypeConfig Id', async () => {
      try {
        await itAdminSession.resources.projects
          .project(projectId1)
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(nonExistentEnvTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: 'Resource not found'
          })
        );
      }
    });
  });

  describe('ITAdmin tests', () => {
    describe('get environments type config for project', () => {
      describe('when the environment type config is', () => {
        describe('associated to the project', () => {
          beforeEach(async () => {
            await itAdminSession.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .associate();
          });

          afterEach(async () => {
            await itAdminSession.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .disassociate();
          });

          test('it returns the etc object', async () => {
            const { data: response } = await itAdminSession.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .get();
            expect(response.id).toBe(envTypeConfigId);
          });
        });

        describe('not associated to the project', () => {
          test('it returns a 404', async () => {
            try {
              await itAdminSession.resources.projects
                .project(projectId2)
                .environmentTypes()
                .environmentType(envTypeId)
                .configurations()
                .environmentTypeConfig(envTypeConfigId)
                .get();
            } catch (e) {
              checkHttpError(
                e,
                new HttpError(404, {
                  error: 'Not Found',
                  message: 'Resource not found'
                })
              );
            }
          });
        });
      });

      describe('when the project is not associated with the user', () => {
        beforeEach(async () => {
          const { data: user } = await itAdminSession.resources.users.user(itAdminSession.getUserId()!).get();
          expect(user.roles).toContain('ITAdmin');
          expect(user.roles).not.toContain(getProjectAdminRole(projectId2));
          expect(user.roles).not.toContain(getResearcherRole(projectId2));
        });

        test('it returns a 404', async () => {
          try {
            await itAdminSession.resources.projects
              .project(projectId2)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .get();
          } catch (e) {
            checkHttpError(
              e,
              new HttpError(404, {
                error: 'Not Found',
                message: 'Resource not found'
              })
            );
          }
        });
      });
    });

    test('GET environments type configs executes successfully', async () => {
      const { data: response } = await itAdminSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .get();
      expect(response.id).toBe(envTypeConfigId);
    });
  });

  describe('Project Admin tests', () => {
    describe('get environments type config for project', () => {
      describe('when the environment type config is', () => {
        describe('associated to the project', () => {
          beforeEach(async () => {
            await itAdminSession.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .associate();
          });

          afterEach(async () => {
            await itAdminSession.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .disassociate();
          });

          test('it returns the etc object', async () => {
            const { data: response } = await pa1Session.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .get();
            expect(response.id).toBe(envTypeConfigId);
          });
        });

        describe('not associated to the project', () => {
          describe('and the user and project are', () => {
            describe('associated', () => {
              beforeEach(async () => {
                const { data: user } = await pa1Session.resources.users.user(pa1Session.getUserId()!).get();
                expect(user.roles).toContain(getProjectAdminRole(projectId1));
              });

              test('it returns a 404', async () => {
                try {
                  await pa1Session.resources.projects
                    .project(projectId1)
                    .environmentTypes()
                    .environmentType(envTypeId)
                    .configurations()
                    .environmentTypeConfig(envTypeConfigId)
                    .get();
                } catch (e) {
                  checkHttpError(
                    e,
                    new HttpError(404, {
                      error: 'Not Found',
                      message: 'Resource not found'
                    })
                  );
                }
              });
            });

            describe('not associated', () => {
              beforeEach(async () => {
                const { data: user } = await pa1Session.resources.users.user(pa1Session.getUserId()!).get();
                expect(user.roles).not.toContain(getResearcherRole(projectId2));
              });

              test('it returns a 403', async () => {
                try {
                  await pa1Session.resources.projects
                    .project(projectId2)
                    .environmentTypes()
                    .environmentType(envTypeId)
                    .configurations()
                    .environmentTypeConfig(envTypeConfigId)
                    .get();
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
        });
      });
    });
  });

  describe('Researcher tests', () => {
    describe('get environments type config for project', () => {
      describe('when the environment type config is', () => {
        describe('associated to the project', () => {
          beforeEach(async () => {
            await itAdminSession.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .associate();
          });

          afterEach(async () => {
            await itAdminSession.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .disassociate();
          });

          test('it returns the etc object', async () => {
            const { data: response } = await researcherSession.resources.projects
              .project(projectId1)
              .environmentTypes()
              .environmentType(envTypeId)
              .configurations()
              .environmentTypeConfig(envTypeConfigId)
              .get();
            expect(response.id).toBe(envTypeConfigId);
          });
        });

        describe('not associated to the project', () => {
          describe('and the user and project are', () => {
            describe('associated', () => {
              beforeEach(async () => {
                const { data: user } = await itAdminSession.resources.users
                  .user(researcherSession.getUserId()!)
                  .get();
                expect(user.roles).toContain(getResearcherRole(projectId1));
              });

              test('it returns a 404', async () => {
                try {
                  await researcherSession.resources.projects
                    .project(projectId1)
                    .environmentTypes()
                    .environmentType(envTypeId)
                    .configurations()
                    .environmentTypeConfig(envTypeConfigId)
                    .get();
                } catch (e) {
                  checkHttpError(
                    e,
                    new HttpError(404, {
                      error: 'Not Found',
                      message: 'Resource not found'
                    })
                  );
                }
              });
            });

            describe('not associated', () => {
              beforeEach(async () => {
                const { data: user } = await itAdminSession.resources.users
                  .user(researcherSession.getUserId()!)
                  .get();
                expect(user.roles).not.toContain(getResearcherRole(projectId2));
              });

              test('it returns a 403', async () => {
                try {
                  await researcherSession.resources.projects
                    .project(projectId2)
                    .environmentTypes()
                    .environmentType(envTypeId)
                    .configurations()
                    .environmentTypeConfig(envTypeConfigId)
                    .get();
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
        });
      });
    });
  });
});
