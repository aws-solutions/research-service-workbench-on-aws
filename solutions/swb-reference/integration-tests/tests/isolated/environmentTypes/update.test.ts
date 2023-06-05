/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { lengthValidationMessage, swbDescriptionMaxLength, swbNameMaxLength } from '@aws/swb-app';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, generateRandomAlphaNumericString } from '../../../support/utils/utilities';

describe('update environment types', () => {
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  const testEnvTypeId = 'et-prod-0123456789012,pa-0123456789012';
  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('fails when trying to update invalid prop', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          invalidProp: 'invalidValue'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: ": Unrecognized key(s) in object: 'invalidProp'"
        })
      );
    }
  });

  test('fails when trying to update invalid environment Type', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          name: 'new-Name',
          status: 'APPROVED'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find environment type ${testEnvTypeId} to update`
        })
      );
    }
  });

  test('fails when trying to update invalid environment Type id format', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType('wrong-format-id').update(
        {
          name: 'new_Name'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'envTypeId: Invalid ID'
        })
      );
    }
  });
  test('fails when trying to update name surpassing length', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          name: generateRandomAlphaNumericString(swbNameMaxLength + 1)
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `name: ${lengthValidationMessage(swbNameMaxLength)}`
        })
      );
    }
  });
  test('fails when trying to update description surpassing length', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          description: generateRandomAlphaNumericString(swbDescriptionMaxLength + 1)
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `description: ${lengthValidationMessage(swbDescriptionMaxLength)}`
        })
      );
    }
  });
});
