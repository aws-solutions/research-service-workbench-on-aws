import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    fixturesFolder: 'end-to-end-tests/cypress/fixtures',
    fileServerFolder: 'end-to-end-tests',
    screenshotsFolder: 'end-to-end-tests/cypress/screenshots',
    videosFolder: 'end-to-end-tests/cypress/videos',
    downloadsFolder: 'end-to-end-tests/cypress/downloads',
    supportFile: 'end-to-end-tests/cypress/support/e2e.ts',
    specPattern: 'end-to-end-tests/cypress/**/*.cy.{js,jsx,ts,tsx}',
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      //this function is called in a different scope making cypress and cy commands unable to work
      const environment = getEnvironmentVariables(config.env.STAGE);
      environment.AdminPassword = config.env.AdminPassword ?? environment.AdminPassword; //read password from yaml only when password is not set in env variables already
      config.env = { ...config.env, ...environment };
      config.baseUrl = environment.uiClientURL;
      // implement node event listeners here
      return config;
    }
  }
});

const getEnvironmentVariables = (stage: string): any => {
  const fs = require('fs');
  const yaml = require('js-yaml');
  const _ = require('lodash');
  const apiStackOutputs: any = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(`${__dirname}/src/config/${stage}.json`, 'utf8') // nosemgrep
  );
  const yamlConfig: any = yaml.load(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(`${__dirname}/end-to-end-tests/config/${stage}.yaml`, 'utf8') // nosemgrep
  );
  const apiStackName = Object.entries(apiStackOutputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
  // eslint-disable-next-line security/detect-object-injection
  const outputs = apiStackOutputs[apiStackName];
  return { ...outputs, ...yamlConfig };
};
