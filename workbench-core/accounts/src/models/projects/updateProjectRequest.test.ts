/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { UpdateProjectRequestParser } from './updateProjectRequest';

describe('UpdateProjectRequestParser', () => {
  let requestObject: Record<string, JSONValue>;

  beforeEach(() => {
    requestObject = { projectId: 'proj-123' };
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
              code: 'custom',
              message: 'name must be non empty',
              path: ['updatedValues', 'name']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
    describe('is non empty', () => {
      beforeEach(() => {
        expectedName = 'new name';
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
              code: 'custom',
              message: 'description must be non empty',
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
