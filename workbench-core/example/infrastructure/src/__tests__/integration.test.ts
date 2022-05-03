import axios from 'axios';

describe('IntegrationTest', () => {
  test("Service returns 'Hello World'", async () => {
    try {
      if (process.env.SERVICE_ENDPOINT) {
        console.log(process.env.SERVICE_ENDPOINT);
      }
      const SERVICE_ENDPOINT: string =
        process.env.SERVICE_ENDPOINT || 'https://l51vbx69s4.execute-api.us-west-2.amazonaws.com/';
      const response = await axios.get(SERVICE_ENDPOINT, {});
      expect(response.data).toBe('Hello World');
    } catch (e) {
      console.error(e);
      throw e;
    }
  });
});
