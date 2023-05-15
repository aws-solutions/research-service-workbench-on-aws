/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { nonEmptyMessage, betweenFilterMessage } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('List Project negative tests', () => {
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;

  beforeEach(async () => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession } = await paabHelper.createResources());
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('with filter', () => {
    describe('with name that is empty', () => {
      beforeEach(async () => {});

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.projects.get({
            filter: { name: { eq: '' } }
          });
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `filter.name.eq: ${nonEmptyMessage}`
            })
          );
        }
      });
    });

    describe('with createdAt', () => {
      beforeEach(async () => {});
      describe('with value1 > value2', () => {
        test('it throws 400 error', async () => {
          try {
            await adminSession.resources.projects.get({
              filter: {
                createdAt: {
                  between: {
                    value1: '2023-05-14T07:23:39.311Z',
                    value2: '2023-05-11T07:23:39.311Z'
                  }
                }
              }
            });
          } catch (e) {
            checkHttpError(
              e,
              new HttpError(400, {
                error: 'Bad Request',
                message: `filter.createdAt.between: ${betweenFilterMessage}`
              })
            );
          }
        });
      });
    });
  });
});
