/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { lengthValidationMessage } from '@aws/workbench-core-base';
import _ from 'lodash';
import ClientSession from '../../../support/clientSession';
import { AccountHelper } from '../../../support/complex/accountHelper';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('awsAccounts create negative tests', () => {
  const setup: Setup = Setup.getSetup();
  const paabHelper: PaabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  const validLaunchParameters = {
    awsAccountId: '123456789012',
    envMgmtRoleArn: `arn:aws:iam::123456789012:role/${randomTextGenerator.getFakeText(
      'fakeEnvMgmtRoleArn'
    )}-env-mgmt`,
    hostingAccountHandlerRoleArn: `arn:aws:iam::123456789012:role/${randomTextGenerator.getFakeText(
      'fakeHostingAccountHandlerRoleArn'
    )}-hosting-account-role`,
    name: randomTextGenerator.getFakeText('fakeName'),
    externalId: randomTextGenerator.getFakeText('fakeExternalId')
  };

  describe('when creating an account', () => {
    describe('and the creation params are invalid', () => {
      test('with empty body it throws a validation error', async () => {
        try {
          await adminSession.resources.accounts.create({}, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'name: Required. awsAccountId: Required. envMgmtRoleArn: Required. hostingAccountHandlerRoleArn: Required. externalId: Required'
            })
          );
        }
      });
      test('with accountId that is too long it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.awsAccountId = '123456789012345';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'awsAccountId: must be a 12 digit number'
            })
          );
        }
      });
      test('with hostingAccountHandlerRoleArn that is too long it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.hostingAccountHandlerRoleArn =
            'arn:aws:iam::123456789012:role/message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-abcde-hosting-account-role';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `hostingAccountHandlerRoleArn: ${lengthValidationMessage(400)}`
            })
          );
        }
      });
      test('with envMgmtRoleArn that is too long it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.envMgmtRoleArn =
            'arn:aws:iam::123456789012:role/message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-abcdefghijklmnopq-env-mgmt';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `envMgmtRoleArn: ${lengthValidationMessage(400)}`
            })
          );
        }
      });
      test('with name that is too long it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.name =
            'string-longer-than-112-characters-string-longer-than-112-characters-string-longer-than-112-characters-abcdefghijk';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `name: ${lengthValidationMessage(112)}`
            })
          );
        }
      });
      test('with externalId that is too long it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.externalId =
            'message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-message-that-is-longer-than-400-characters-abcdefghijklmn';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'externalId: must contain only letters, numbers, hyphens, underscores, plus, equal, comma, period, at (@), colon (:), and forward slash (/). String length must be between 2 and 400 characters inclusively'
            })
          );
        }
      });
      test('with accountId of account that does not exist it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.awsAccountId = '123456789012';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: "Please provide a valid 'awsAccountId' for the hosting account"
            })
          );
        }
      });
      test('with incorrect envMgtmRoleArn and hostingAccountHandlerRoleArn it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.envMgmtRoleArn = 'fakeValue';
          body.hostingAccountHandlerRoleArn = 'fakeValue';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'envMgmtRoleArn: must be a valid envMgmtRoleArn. hostingAccountHandlerRoleArn: must be a valid hostingAccountHandlerRoleArn'
            })
          );
        }
      });
    });
    describe('and the account is already onboarded', () => {
      test('it throws an error', async () => {
        const accountHelper = new AccountHelper();
        const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
        const existingAccounts = await accountHelper.listOnboardedAccounts();

        invalidParam.awsAccountId = _.first(existingAccounts)!.awsAccountId;

        try {
          await adminSession.resources.accounts.create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'This AWS Account was found in DDB. Please provide the correct id value in request body'
            })
          );
        }
      });
    });
  });

  describe('Project admin or researcher can not create aws Accounts', () => {
    describe('As project admin', () => {
      test('it throws 403 error', async () => {
        try {
          await paSession.resources.accounts.create({}, false);
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

    describe('As researcher', () => {
      test('it throws 403 error', async () => {
        try {
          await researcherSession.resources.accounts.create({}, false);
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

    describe('As unauthenticated user', () => {
      test('it throws 403 error', async () => {
        try {
          await anonymousSession.resources.accounts.create({}, false);
        } catch (e) {
          checkHttpError(e, new HttpError(403, {}));
        }
      });
    });
  });
});
