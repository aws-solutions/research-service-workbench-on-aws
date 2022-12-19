import { defineConfig } from 'cypress';
import { CypressConfig, EnvTypeConfig } from './end-to-end-tests/cypress/support/models';

const getEnvironmentVariables = (stage: string): CypressConfig => {
  const fs = require('fs');
  const yaml = require('js-yaml');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiStackOutputs: any = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(`${__dirname}/../infrastructure/src/config/${stage}.json`, 'utf8') // nosemgrep
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yamlConfig: any = yaml.load(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(`${__dirname}/end-to-end-tests/config/${stage}.yaml`, 'utf8') // nosemgrep
  );
  const apiStackName = Object.entries(apiStackOutputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
  // eslint-disable-next-line security/detect-object-injection
  const outputs = apiStackOutputs[apiStackName];
  const ADMIN_USER = yamlConfig.AdminUser;
  const ADMIN_PASSWORD = yamlConfig.AdminPassword;
  const ENVIRONMENT_TYPES = yamlConfig.EnvTypes as EnvTypeConfig[];
  const ENVIRONMENT_PROJECT: string = yamlConfig.EnvProject;
  const ENVIRONMENT_STUDIES: string[] = yamlConfig.EnvStudies;
  const CLEAN_UP_ENVIRONMENTS = yamlConfig.CleanEnvironments;
  const BASE_URL = outputs.WebsiteURL;
  const COGNITO_DOMAIN_NAME = outputs.CognitoURL;

  return {
    ADMIN_USER,
    ADMIN_PASSWORD,
    BASE_URL,
    COGNITO_DOMAIN_NAME,
    ENVIRONMENT_TYPES,
    ENVIRONMENT_PROJECT,
    ENVIRONMENT_STUDIES,
    CLEAN_UP_ENVIRONMENTS
  };
};

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
    setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
      //this function is called in a different scope making cypress and cy commands unable to work
      const environment = getEnvironmentVariables(config.env.STAGE);
      environment.ADMIN_PASSWORD = config.env.AdminPassword ?? environment.ADMIN_PASSWORD; //read password from yaml only when password is not set in env variables already
      environment.ADMIN_USER = config.env.AdminUser ?? environment.ADMIN_USER; //read user from yaml only when user is not set in env variables already
      config.env = { ...config.env, ...environment };
      config.baseUrl = environment.BASE_URL;
      // implement node event listeners here
      return config;
    }
  }
});
