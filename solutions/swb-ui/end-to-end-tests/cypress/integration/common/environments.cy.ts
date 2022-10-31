import { getFakeText, validateTableData } from '../../support/common-utils';
import {
  CLEANUP_WAIT_ENVIRONMENTS_GRID_IN_MILISECONDS,
  CLEAN_UP_ENVIRONMENTS,
  ENVIRONMENT_PROJECT_PROPERTY,
  ENVIRONMENT_START_MAX_WAITING_MILISECONDS,
  ENVIRONMENT_STOP_MAX_WAITING_MILISECONDS,
  ENVIRONMENT_STUDIES_PROPERTY,
  ENVIRONMENT_TABLE_DATA_TEST_ID,
  ENVIRONMENT_TYPES_PROPERTY
} from '../../support/constants';
import {
  cleanupEnvironments,
  createEnvironment,
  excecuteEnvironmentAction
} from '../../support/environments-utils';
import { CreateEnvironmentForm, EnvTypeConfig } from '../../support/models';

describe('Environment Operations', () => {
  const environmentTypes = Cypress.env(ENVIRONMENT_TYPES_PROPERTY) as EnvTypeConfig[];
  const createdEnvs: string[] = [];
  before(() => {
    cy.login('ITAdmin');
    if (Cypress.env(CLEAN_UP_ENVIRONMENTS) as boolean) {
      //only clean environments when variable is setup
      cy.wait(CLEANUP_WAIT_ENVIRONMENTS_GRID_IN_MILISECONDS); //cannot use get as there may be no elements in grid to wait for and cleanup process should not stop the e2e test
      cleanupEnvironments();
    }
  });

  it('Should launch, stop, start, connect and terminate environment of all environment types configured', () => {
    const environmentProject = Cypress.env(ENVIRONMENT_PROJECT_PROPERTY) as string;
    const environmentStudies = Cypress.env(ENVIRONMENT_STUDIES_PROPERTY) as string[];
    //create one environment for each environment type configured and check pending status
    environmentTypes.forEach((envType) => {
      const envName = getFakeText(envType.EnvironmentType);
      const environment: CreateEnvironmentForm = {
        Name: envName,
        EnvironmentType: envType.EnvironmentType,
        EnvironmentTypeConfig: envType.EnvironmentTypeConfig,
        Project: environmentProject,
        Studies: environmentStudies
      };
      createEnvironment(environment);
      createdEnvs.push(envName);
      if (environmentStudies?.length) {
        //make sure we test environment creation without studies
        const envNameNoStudies = getFakeText(envType.EnvironmentType);
        createEnvironment({ ...environment, Studies: [], Name: envNameNoStudies });
        createdEnvs.push(envNameNoStudies);
      }
    });

    //verify completed status on all envs ***this was separated from create as we want to run actions on environments in parallel to save time***
    createdEnvs.forEach((envName) => {
      validateTableData(
        ENVIRONMENT_TABLE_DATA_TEST_ID,
        envName,
        'Workspace status',
        'COMPLETED',
        ENVIRONMENT_START_MAX_WAITING_MILISECONDS
      );
    });
    createdEnvs.forEach((envName) => excecuteEnvironmentAction(envName, 'CONNECT'));
    //select environment and stop for all created environments
    createdEnvs.forEach((envName) => excecuteEnvironmentAction(envName, 'STOP'));
    //verify all created environment are stopped
    createdEnvs.forEach((envName) => {
      validateTableData(
        ENVIRONMENT_TABLE_DATA_TEST_ID,
        envName,
        'Workspace status',
        'STOPPED',
        ENVIRONMENT_STOP_MAX_WAITING_MILISECONDS
      );
    });
    //select environment and start again for all created environments
    createdEnvs.forEach((envName) => excecuteEnvironmentAction(envName, 'START'));
    //verify all created environment are completed
    createdEnvs.forEach((envName) => {
      validateTableData(
        ENVIRONMENT_TABLE_DATA_TEST_ID,
        envName,
        'Workspace status',
        'COMPLETED',
        ENVIRONMENT_START_MAX_WAITING_MILISECONDS
      );
    });
    //select environment and stop again for all created environments
    createdEnvs.forEach((envName) => excecuteEnvironmentAction(envName, 'STOP'));
    //verify all created environment are stopped
    createdEnvs.forEach((envName) => {
      validateTableData(
        ENVIRONMENT_TABLE_DATA_TEST_ID,
        envName,
        'Workspace status',
        'STOPPED',
        ENVIRONMENT_STOP_MAX_WAITING_MILISECONDS
      );
    });
    //select environment and terminate for all created environments
    createdEnvs.forEach((envName) => excecuteEnvironmentAction(envName, 'TERMINATE'));
  });
});
