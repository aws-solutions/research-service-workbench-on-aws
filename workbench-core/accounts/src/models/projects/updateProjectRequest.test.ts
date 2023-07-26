/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey, nonEmptyMessage } from '@aws/workbench-core-base';
import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { UpdateProjectRequestParser } from './updateProjectRequest';

describe('UpdateProjectRequestParser', () => {
  let requestObject: Record<string, JSONValue>;
  const mockUuid = '1234abcd-1234-abcd-1234-abcd1234abcd';
  const mockProjectId = `${resourceTypeToKey.project.toLowerCase()}-${mockUuid}`;
  beforeEach(() => {
    requestObject = { projectId: mockProjectId };
  });

  describe('when name', () => {
    let expectedName: string;
    describe('is empty', () => {
      beforeEach(() => {
        requestObject.updatedValues = { name: '' };
      });

      test('it fails', async () => {
        // OPERATE
        const parsed = UpdateProjectRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              message: nonEmptyMessage,
              exact: false,
              path: ['updatedValues', 'name']
            }
          ];
          console.log('issues', parsed.error.issues);
          console.log('error', parsed.error);
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
    describe('is non empty', () => {
      beforeEach(() => {
        expectedName = 'newName';
        requestObject.updatedValues = { name: expectedName };
      });

      test('it succeeds', () => {
        // OPERATE
        const parsed = UpdateProjectRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.updatedValues.name).toEqual(expectedName);
        }
      });
    });
    describe('is not defined', () => {
      beforeEach(() => {
        requestObject.updatedValues = {};
      });

      test('it succeeds', async () => {
        // OPERATE
        const parsed = UpdateProjectRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.updatedValues.name).toBeUndefined();
        }
      });
    });
  });

  describe('when description', () => {
    let expectedDescription: string;
    describe('is empty', () => {
      beforeEach(() => {
        requestObject.updatedValues = { description: '' };
      });

      test('it fails', async () => {
        // OPERATE
        const parsed = UpdateProjectRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              message: nonEmptyMessage,
              exact: false,
              path: ['updatedValues', 'description']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
    describe('is non empty', () => {
      beforeEach(() => {
        expectedDescription = 'new description';
        requestObject.updatedValues = { description: expectedDescription };
      });

      test('it succeeds', () => {
        // OPERATE
        const parsed = UpdateProjectRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.updatedValues.description).toEqual(expectedDescription);
        }
      });
    });
    describe('is not defined', () => {
      beforeEach(() => {
        requestObject.updatedValues = {};
      });

      test('it succeeds', async () => {
        // OPERATE
        const parsed = UpdateProjectRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.updatedValues.description).toBeUndefined();
        }
      });
    });
  });

  describe('when updatedValues', () => {
    describe('is undefined', () => {
      test('it fails', async () => {
        // OPERATE
        const parsed = UpdateProjectRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'invalid_type',
              expected: 'object',
              message: 'Required',
              path: ['updatedValues'],
              received: 'undefined'
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
  });
});
