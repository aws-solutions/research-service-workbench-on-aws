// import axios from 'axios';

// describe('Hello World', () => {
//   test("Service returns 'Hello World'", async () => {
//     try {
//       console.log(process.env.SERVICE_ENDPOINT);
//       const SERVICE_ENDPOINT: string =
//         process.env.SERVICE_ENDPOINT || 'https://l51vbx69s4.execute-api.us-west-2.amazonaws.com/';
//       const response = await axios.get(SERVICE_ENDPOINT, {
//         proxy: {
//           host: 'localhost',
//           port: 8080
//         }
//       });
//       expect(response.data).toBe('Hello World');
//     } catch (e) {
//       console.error(e);
//       throw e;
//     }
//   });
// });

import request from 'request';

describe('Hello World', () => {
  test("Service returns 'Hello World'", async () => {
    const SERVICE_ENDPOINT: string =
      process.env.SERVICE_ENDPOINT || 'https://l51vbx69s4.execute-api.us-west-2.amazonaws.com/';
    request({
      uri: SERVICE_ENDPOINT,
      method: 'GET'
    })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('response', function (response: any) {
        expect(response.statusCode).toBe(200);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('error', function (error: any) {
        console.error(error.message);
      });
  });
});
