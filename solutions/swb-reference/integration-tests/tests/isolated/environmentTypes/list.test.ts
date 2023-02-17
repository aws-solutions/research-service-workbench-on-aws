/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list environment types', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('list environments types when filter and sorting by name', async () => {
    const { data: response } = await adminSession.resources.environmentTypes.get({
      filter: {
        name: { begins: 'Sage' }
      },
      sort: {
        name: 'desc'
      }
    });
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('list environments types when filter and sorting by status', async () => {
    const { data: response } = await adminSession.resources.environmentTypes.get({
      filter: {
        status: { begins: 'NOT' }
      },
      sort: {
        status: 'desc'
      }
    });
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('list environments types fails when filter by invalid prop', async () => {
    try {
      await adminSession.resources.environmentTypes.get({
        filter: {
          someProperty: { begins: 'NOT' }
        }
      });
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: "filter: Unrecognized key(s) in object: 'someProperty'"
        })
      );
    }
  });

  test('list environments types fails when filter and sorting different props', async () => {
    try {
      await adminSession.resources.environmentTypes.get({
        filter: {
          status: { begins: 'NOT' }
        },
        sort: {
          name: 'desc'
        }
      });
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'Cannot apply a filter and sort to different properties at the same time'
        })
      );
    }
  });
});
