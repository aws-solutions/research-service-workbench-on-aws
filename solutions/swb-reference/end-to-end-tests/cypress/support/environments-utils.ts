import {
  clickSelectAllGrid,
  selectItemCard,
  selectItemDropDown,
  selectItemGrid,
  verifyDataGtid
} from './common-utils';
import {
  DEFLAKE_DELAY_IN_MILLISECONDS,
  ENVIRONMENT_PROJECT_PROPERTY,
  ENVIRONMENT_STARTNG_MAX_WAITING_MILISECONDS,
  ENVIRONMENT_STUDIES_PROPERTY
} from './constants';
import { EnvTypeConfig } from './models';

export const createEnvironment = (envName: string, envType: EnvTypeConfig): void => {
  const environmentProject = Cypress.env(ENVIRONMENT_PROJECT_PROPERTY) as string;
  const environmentStudies = Cypress.env(ENVIRONMENT_STUDIES_PROPERTY) as string[];
  navigateToCreateEnvironment();
  cy.get('[data-testid="environmentTypeSearch"]').type(envType.EnvironmentType);
  selectItemCard('EnvTypeCards', envType.EnvironmentType);
  cy.get(`[data-testid="environmentName"] input`).type(envName);
  selectItemDropDown('environmentProject', [environmentProject]);
  selectItemDropDown('environmentStudies', environmentStudies);
  selectItemCard('EnvTypeConfigCards', envType.EnvironmentTypeConfig);
  cy.get(`[data-testid="environmentDescription"]`).type(envName);
  cy.get('[data-testid="environmentCreateSubmit"]').should('be.enabled');
  cy.get('[data-testid="environmentCreateSubmit"]').click();
  verifyDataGtid(
    'environmentsGrid',
    envName,
    'Workspace status',
    'PENDING',
    ENVIRONMENT_STARTNG_MAX_WAITING_MILISECONDS
  );
};

export function navigateToCreateEnvironment() {
  cy.visit('/environments');
  cy.get('[data-testid="environmentListHeader"]').contains('Workspaces').should('be.visible');
  cy.get('[data-testid="environmentCreate"]').click();
  cy.get('[data-testid="environmentCreateHeader"]').should('be.visible');
  cy.get('[data-testid="environmentCreateSubmit"]').should('be.disabled');
}

export function excecuteEnvironmentAction(
  environmentName: string,
  action: 'START' | 'STOP' | 'CONNECT' | 'TERMINATE'
) {
  //centralize actions so we can add one throttle waiting time only once
  cy.wait(DEFLAKE_DELAY_IN_MILLISECONDS); //avoid throttle issues
  switch (action) {
    case 'CONNECT':
      connectEnvironment(environmentName);
      break;
    case 'START':
      startEnvironment(environmentName);
      break;
    case 'STOP':
      stopEnvironment(environmentName);
      break;
    case 'TERMINATE':
      terminateEnvironment(environmentName);
      break;
  }
}

export function connectEnvironment(environmentName: string) {
  selectItemGrid('environmentsGrid', environmentName);
  cy.get('[data-testid="environmentStart"]').should('be.disabled');
  cy.get('[data-testid="environmentTerminate"]').should('be.disabled');
  cy.get('[data-testid="environmentConnect"]').should('be.enabled');
  cy.get('[data-testid="environmentConnect"]')
    .click()
    .then(() => {
      cy.contains('Connect to Workspace');
      cy.get('[data-testid="environmentConnectClose"]')
        .should('be.visible')
        .click()
        .then(() => {
          selectItemGrid('environmentsGrid', environmentName); //deselect
        });
    });
}

export function stopEnvironment(environmentName: string) {
  selectItemGrid('environmentsGrid', environmentName);
  cy.get('[data-testid="environmentStop"]').should('be.enabled');
  cy.get('[data-testid="environmentStop"]').click();
  verifyDataGtid('environmentsGrid', environmentName, 'Workspace status', 'STOPPING');
}

export function startEnvironment(environmentName: string) {
  selectItemGrid('environmentsGrid', environmentName);
  cy.get('[data-testid="environmentConnect"]').should('be.disabled');
  cy.get('[data-testid="environmentStop"]').should('be.disabled');
  cy.get('[data-testid="environmentStart"]').should('be.enabled');
  cy.get('[data-testid="environmentTerminate"]').should('be.enabled');
  cy.get('[data-testid="environmentStart"]').click();
  verifyDataGtid('environmentsGrid', environmentName, 'Workspace status', 'STARTING');
}

export function terminateEnvironment(environmentName: string) {
  selectItemGrid('environmentsGrid', environmentName);
  cy.get('[data-testid="environmentTerminate"]').click();
  verifyDataGtid('environmentsGrid', environmentName, 'Workspace status', 'TERMINATING');
}

/*******************************************************************************************************************************************************************
 * This function will try to move all environments one step further to termination
 * e.g.
 * COMPLETED EnvironmentA will be STOPPED
 * STOPPED EnvironmentB will be TERMINATED
 * FAILED EnvironmentC will be TERMINATED
 *
 * If an environment fails to terminate or stop, excecution will continue as cleanup is not required for e2e tests to run
 * Environments in PENDING, STARTING, STOPPING and TERMINATING status will be ignored to speed up e2e testing
 *******************************************************************************************************************************************************************/
export function cleanupEnvironments() {
  cy.contains('[data-testid="environmentsGrid"] th', new RegExp(`^Workspace name$`))
    .invoke('index')
    .then((nameIndex: number) => {
      cy.contains('[data-testid="environmentsGrid"] th', new RegExp(`^Workspace status$`))
        .invoke('index')
        .then((statusIndex) => {
          const envNames = Cypress.$(`[data-testid="environmentsGrid"] tr td:nth-child(${nameIndex + 1})`);
          envNames.each((index, item) => {
            cleanupEnvironmentRow(statusIndex + 1, item.textContent);
          });
        });
    });
}

function cleanupEnvironmentRow(statusIndex: number, envName: string) {
  cy.wait(DEFLAKE_DELAY_IN_MILLISECONDS); //avoid throttle
  let currentEnv = Cypress.$(
    `[data-testid="environmentsGrid"] tr:has(div[data-testid="${envName}"]) td[class^="awsui_selection-contro"]`
  ); //make sure row still exists in case is terminating
  if (currentEnv.length === 0) return;
  selectItemGrid('environmentsGrid', envName);
  cy.get(
    `[data-testid="environmentsGrid"] tr:has(div[data-testid="${envName}"]) td:nth-child(${statusIndex})`
  )
    .invoke('text')
    .then((text: string) => {
      // get status from row
      switch (text) {
        case 'COMPLETED':
          cy.get('[data-testid="environmentStop"]').click({ force: true });
          break;
        case 'FAILED':
        case 'STOPPED':
          cy.get('[data-testid="environmentTerminate"]').click({ force: true });
          break;
        default:
          break;
      }
    });
  clickSelectAllGrid('environmentsGrid'); //reset selection with select all deselect all
  clickSelectAllGrid('environmentsGrid');
}
