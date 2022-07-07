import { isEnvironmentStatus } from './environmentStatus';

describe(isEnvironmentStatus, () => {
  it('non string status should return false', async () => {
    // OPERATE n CHECK
    expect(isEnvironmentStatus(2)).toEqual(false);
  });
});
