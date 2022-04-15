import { testBuild } from '../helper';

describe('root tests', () => {
  const app = testBuild();

  test('default root route', async () => {
    const res = await app.inject({
      url: '/'
    });
    expect(JSON.parse(res.payload)).toEqual({ message: 'this is an example' });
  });
});
