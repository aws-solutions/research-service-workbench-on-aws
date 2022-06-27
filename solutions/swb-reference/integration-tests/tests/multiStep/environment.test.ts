import Setup from '../../support/setup';

describe('multiStep environment test', () => {
  test('launch, connect, stop, get, terminate', () => {
    // @ts-ignore
    // console.log('settings', global['__settings__']);
    // @ts-ignore
    // console.log('settings', __settings__);

    const setup = new Setup();
    const apiBaseUrl = setup.settings.get('apiBaseUrl');
    console.log('apiBaseUrl', apiBaseUrl);
    expect(true).toEqual(true);
  });
});
