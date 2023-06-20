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
  testTimeout: 30 * 60 * 1000,
  moduleNameMapper: {
    '#node-web-compat': './node-web-compat-node.js'
  }
};

let settings;
async function init() {
  // jest might call the jest.config exported async function multiple times, we don't need to be doing
  // the global initialization logic multiple times.
  if (settings) return;

  const testEnvStage = 'testEnv';
  const hostingEnvStage = 'hostingEnv';

  const config = yaml.load(
    fs.readFileSync(join(__dirname, `integration-tests/config/${testEnvStage}.yaml`), 'utf8')
  );

  let testEnvOutputs;
  try {
    const apiStackOutputs = JSON.parse(
      fs.readFileSync(join(__dirname, `src/config/${testEnvStage}.json`), 'utf8') // nosemgrep
    );
    const apiStackName = Object.entries(apiStackOutputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
    testEnvOutputs = apiStackOutputs[apiStackName];
  } catch (e) {
    throw new Error(
      'There was a problem reading the main stage file. Please run cdk-deploy prior to running the integration test suite'
    );
  }

  let hostEnvOutputs;
  try {
    const apiStackOutputs = JSON.parse(
      fs.readFileSync(join(__dirname, `src/config/${hostingEnvStage}.json`), 'utf8') // nosemgrep
    );
    const apiStackName = Object.entries(apiStackOutputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
    hostEnvOutputs = apiStackOutputs[apiStackName];
  } catch (e) {
    throw new Error(
      'There was a problem reading the hosting stage file. Please run cdk-deploy prior to running the integration test suite'
    );
  }
  settings = {
    ...config,
    ...testEnvOutputs,
    ...hostEnvOutputs,
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
