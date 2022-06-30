const yaml = require('js-yaml');
const { join } = require('path');
const fs = require('fs');
// const Settings = require('./integration-tests/support/utils/settings');

const options = {
  transform: {
    '\\.(ts)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  testTimeout: 30 * 60 * 1000
};

let settings;
async function init() {
  // jest might call the jest.config exported async function multiple times, we don't need to be doing
  // the global initialization logic multiple times.
  if (settings) return;

  const stage = process.env.STAGE;

  const config = yaml.load(
    fs.readFileSync(join(__dirname, `integration-tests/config/${stage}.yaml`), 'utf8')
  );

  settings = {
    ...config,
    runId: `${Date.now()}`
  };
}

module.exports = async () => {
  await init();
  return {
    ...options,
    globals: {
      __settings__: settings
    }
  };
};
