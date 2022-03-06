import { testBuild } from '../../helper';

describe('example tests', () => {
  const app = testBuild();

  test('example is loaded', async () => {
    const res = await app.inject({
      url: '/example'
    });

    expect(res.payload).toBe('this is an example');
  });

  test('example is with name', async () => {
    const res = await app.inject({
      url: '/example/Bob'
    });

    expect(res.payload).toBe('Hello, Bob');
  });
});
