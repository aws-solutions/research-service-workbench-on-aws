import axios from 'axios';

test("Service returns 'Hello World!'", async () => {
  try {
    const response = await axios.get(`${process.env.SERVICE_ENDPOINT}`, {});
    expect(response.data).toBe('Hello World!');
  } catch (e) {
    console.error(e);
    throw e;
  }
});
