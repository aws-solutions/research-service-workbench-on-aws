import { fc, itProp } from 'jest-fast-check';
import { DdbDataSetMetadataPlugin } from '.';

describe('DdbDataSetMetadataPlugin', () => {
  let plugin: DdbDataSetMetadataPlugin;
  beforeEach(() => {
    plugin = new DdbDataSetMetadataPlugin({ region: 'us-east-1', tableName: 'DataSetsTable' }, 'DS');
  });

  describe('listDataSets', () => {
    it('throws a not implemented error', async () => {
      await expect(() => plugin.listDataSets()).rejects.toThrow(new Error('Method not implemented.'));
    });
  });

  describe('getDataSetsMetadata', () => {
    itProp('throws a not implemented error', [fc.string()], async (name) => {
      await expect(() => plugin.getDataSetMetadata(name)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('listDataSetObjects', () => {
    itProp('throws a not implemented error', [fc.string()], async (dataSetName) => {
      await expect(() => plugin.listDataSetObjects(dataSetName)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('getDataSetObjectMetadata', () => {
    itProp('throws a not implemented error', [fc.string(), fc.string()], async (dataSetName, objectName) => {
      await expect(() => plugin.getDataSetObjectMetadata(dataSetName, objectName)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });
});
