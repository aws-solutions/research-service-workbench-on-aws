import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { ListAccountsRequestParser } from './listAccountsRequest';

describe('ListAccountsRequestParser', () => {
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
        const parsed = ListAccountsRequestParser.safeParse(requestObject);
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

      test('it throws an error', () => {
        const parsed = ListAccountsRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(false);
      });
    });

    describe('is greater than 100', () => {
      beforeEach(() => {
        requestObject = {
          pageSize: '101'
        };
      });

      test('it throws an error', () => {
        const parsed = ListAccountsRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(false);
      });
    });

    describe('is less than 1', () => {
      beforeEach(() => {
        requestObject = {
          pageSize: '0'
        };
      });

      test('it throws an error', () => {
        const parsed = ListAccountsRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(false);
      });
    });
  });
});
