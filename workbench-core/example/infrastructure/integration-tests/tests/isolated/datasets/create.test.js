'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const setup_1 = __importDefault(require('../../../support/setup'));
// import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
describe('datasets create negative tests', () => {
  const setup = new setup_1.default();
  let adminSession;
  // const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  beforeEach(() => {
    expect.hasAssertions();
  });
  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });
  afterAll(async () => {
    await setup.cleanup();
  });
  describe('IntegrationTest', () => {
    test('should return DataSets entry', async () => {
      const response = await adminSession.resources.datasets.get({});
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ pk: 'EXAMPLE-DS#example-ds-c8c71ba1-4111-489c-98b5-05c24f0a3a36' })
        ])
      );
    });
  });
});
//# sourceMappingURL=create.test.js.map
