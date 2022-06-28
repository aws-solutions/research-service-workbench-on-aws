import { sleep } from '../../../support/utils/utilities';

describe('environments connection negative tests', () => {
  beforeAll(() => {
    console.log('before all');
  });
  afterAll(() => {
    console.log('after all');
  });
  test('environment does not exist', async () => {
    const now = Date.now();

    await sleep(3000);
    const later = Date.now();

    const secondsWaited = (later - now) / 1000;
    console.log('secondsWaited', secondsWaited);
    expect(true).toEqual(true);
  });
});
