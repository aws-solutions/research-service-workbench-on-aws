import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { ListCostCentersRequestParser } from './listCostCentersRequest';

describe('ListCostCentersRequestParser', () => {
  let requestObject: Record<string, JSONValue>;
  describe('when pageSize', () => {
    let expectedPageSize: number;

    describe('is valid', () => {
      beforeEach(() => {
        expectedPageSize = 5;
        requestObject = {
          pageSize: `${expectedPageSize}`
        };
      });

      test('it parses the page size into a number', () => {
        const parsed = ListCostCentersRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.pageSize).toEqual(expectedPageSize);
        }
      });
    });

    describe('is NaN', () => {
      beforeEach(() => {
        requestObject = {
          pageSize: 'nonNumber'
        };
      });

      test('it returns an error', () => {
        const parsed = ListCostCentersRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(false);

        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: 'Must be a number',
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
    describe('is less than 0', () => {
      beforeEach(() => {
        expectedPageSize = -1;
        requestObject = {
          pageSize: `${expectedPageSize}`
        };
      });

      test('it returns an error', () => {
        const parsed = ListCostCentersRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(false);

        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: 'Must be 0 or larger',
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
  });
});
