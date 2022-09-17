import {
  CLEANUP_WAIT_ENVIRONMENTS_GRID_IN_MILISECONDS,
  CLEAN_UP_ENVIRONMENTS,
  ENVIRONMENT_START_MAX_WAITING_MILISECONDS,
  ENVIRONMENT_STOP_MAX_WAITING_MILISECONDS,
  ENVIRONMENT_TYPES_PROPERTY
} from '../../support/constants';
import { getFakeText, verifyDataGtid } from '../../support/common-utils';
import { EnvTypeConfig } from '../../support/models';
import {
  cleanupEnvironments,
  createEnvironment,
  excecuteEnvironmentAction
} from '../../support/environments-utils';

describe('IT Admin Login', () => {
  const environmentTypes = Cypress.env(ENVIRONMENT_TYPES_PROPERTY) as EnvTypeConfig[];
  let createdEnvs: string[] = [];
  before(() => {
    cy.login('ITAdmin');
    if (Cypress.env(CLEAN_UP_ENVIRONMENTS) as boolean) {
      //only clean environments when variable is setup
      cy.wait(CLEANUP_WAIT_ENVIRONMENTS_GRID_IN_MILISECONDS); //cannot use get as there may be no elements in grid to wait for and cleanup process should not stop the e2e test
      cleanupEnvironments();
    }
  });

  it('Should launch, stop, start, connect and terminate environment of all environment types configured', () => {
    //create one environment for each environment type configured and check pending status
    environmentTypes.forEach((envType) => {
      const envName = getFakeText(envType.EnvironmentType);
      createEnvironment(envName, envType);
      createdEnvs.push(envName);
    });

    //verify completed status on all envs ***this was separated from create as we want to run actions on environments in parallel to save time***
    createdEnvs.forEach((envName) => {
      verifyDataGtid(
        'environmentsGrid',
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
      verifyDataGtid(
        'environmentsGrid',
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
      verifyDataGtid(
        'environmentsGrid',
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
      verifyDataGtid(
        'environmentsGrid',
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
