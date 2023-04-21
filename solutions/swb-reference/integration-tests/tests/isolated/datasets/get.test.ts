/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, generateInvalidIds } from '../../../support/utils/utilities';

describe('datasets get negative tests', () => {
  const paabHelper: PaabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('ITAdmin tests', () => {
    const invalidDatasets: string[] = generateInvalidIds('dataset');
    test.each(invalidDatasets)(
      'invalid dataset Id throws validation exception for Admin',
      async (invalidDataset) => {
        try {
          await adminSession.resources.datasets.dataset(invalidDataset).get();
        } catch (error) {
          checkHttpError(
            error,
            new HttpError(400, {
              error: 'Bad Request',
              message: `dataSetId: Invalid ID`
            })
          );
        }
      }
    );
  });

  describe('PA tests', () => {
    test('it should fail with unauthorized', async () => {
      try {
        await paSession.resources.datasets.dataset('dataset-12345678-1234-1234-123f-1234567890ab').get();
      } catch (error) {
        checkHttpError(
          error,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
  });

  describe('Researcher tests', () => {
    test('it should fail with unauthorized', async () => {
      try {
        await researcherSession.resources.datasets
          .dataset('dataset-12345678-1234-1234-123f-1234567890ab')
          .get();
      } catch (error) {
        checkHttpError(
          error,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
  });
});
