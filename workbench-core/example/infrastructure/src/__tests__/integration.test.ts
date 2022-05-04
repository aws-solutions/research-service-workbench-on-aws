import axios from 'axios';

describe('IntegrationTest', () => {
  test("Service returns 'Hello World'", async () => {
    try {
      if (process.env.SERVICE_ENDPOINT) {
        console.log(process.env.SERVICE_ENDPOINT);
      }
      const SERVICE_ENDPOINT: string = process.env.SERVICE_ENDPOINT || 'xxx';
      const response = await axios.get(SERVICE_ENDPOINT, {});
      expect(response.data).toBe('Hello World');
    } catch (e) {
      console.error('Integration Test Error: ' + e);
      throw e;
    }
  });
});
