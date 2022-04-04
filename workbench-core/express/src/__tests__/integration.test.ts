import axios from 'axios';

describe('Hello World', () => {
  test("Service returns 'Hello World!'", async () => {
    try {
      console.log(process.env.SERVICE_ENDPOINT);
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
