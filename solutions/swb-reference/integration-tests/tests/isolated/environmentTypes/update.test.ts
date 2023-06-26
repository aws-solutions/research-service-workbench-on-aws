/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { swbNameMaxLength, lengthValidationMessage, swbDescriptionMaxLength } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, generateRandomAlphaNumericString } from '../../../support/utils/utilities';

describe('update environment types', () => {
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;

  const paabHelper: PaabHelper = new PaabHelper(1);
  const testEnvTypeId = 'et-prod-0123456789012,pa-0123456789012';
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
  });

  test('fails when trying to update environment type as projectAdmin', async () => {
    try {
      await paSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          name: 'updated_name'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('fails when trying to update environment type as researcher', async () => {
    try {
      await researcherSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          name: 'updated_name'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
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
          message: `Could not find environment type to update`
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

  test(`Unauthenticated user cannot call update ET`, async () => {
    try {
      await anonymousSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          name: 'updated_name'
        },
        true
      );
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });
});
