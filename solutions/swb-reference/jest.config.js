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

  const regionShortNamesMap = {
    'us-east-2': 'oh',
    'us-east-1': 'va',
    'us-west-1': 'ca',
    'us-west-2': 'or',
    'ap-east-1': 'hk',
    'ap-south-1': 'mum',
    'ap-northeast-3': 'osa',
    'ap-northeast-2': 'sel',
    'ap-southeast-1': 'sg',
    'ap-southeast-2': 'syd',
    'ap-northeast-1': 'ty',
    'ca-central-1': 'ca',
    'cn-north-1': 'cn',
    'cn-northwest-1': 'nx',
    'eu-central-1': 'fr',
    'eu-west-1': 'irl',
    'eu-west-2': 'ldn',
    'eu-west-3': 'par',
    'eu-north-1': 'sth',
    'me-south-1': 'bhr',
    'sa-east-1': 'sao',
    'us-gov-east-1': 'gce',
    'us-gov-west-1': 'gcw'
  };

  settings = {
    ...config,
    regionShortName: regionShortNamesMap[config.awsRegion],
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
