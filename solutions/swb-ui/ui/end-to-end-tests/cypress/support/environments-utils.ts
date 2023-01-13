import {
  clickSelectAllGrid,
  selectItemCard,
  selectItemDropDown,
  selectItemGrid,
  validateTableData
} from './common-utils';
import {
  DEFLAKE_DELAY_IN_MILLISECONDS,
  ENVIRONMENT_TABLE_DATA_TEST_ID,
  ENVIRONMENT_STARTNG_MAX_WAITING_MILISECONDS
} from './constants';
import { CreateEnvironmentForm } from './models';

export const createEnvironment = (environmentData: CreateEnvironmentForm): void => {
  navigateToCreateEnvironment();
  cy.get('[data-testid="environmentTypeSearch"]').type(environmentData.EnvironmentType);
  selectItemCard('EnvTypeCards', environmentData.EnvironmentType);
  cy.get(`[data-testid="environmentName"] input`).type(environmentData.Name);
  selectItemDropDown('environmentProject', [environmentData.Project]);
  if (environmentData.Studies?.length)
    selectItemDropDown('environmentStudies', environmentData.Studies, true);
  selectItemCard('EnvTypeConfigCards', environmentData.EnvironmentTypeConfig);
  cy.get(`[data-testid="environmentDescription"]`).type(environmentData.Name);
  cy.get('[data-testid="environmentCreateSubmit"]').should('be.enabled');
  cy.get('[data-testid="environmentCreateSubmit"]').click();
  validateTableData(
    ENVIRONMENT_TABLE_DATA_TEST_ID,
    environmentData.Name,
    'Workspace status',
    'PENDING',
    ENVIRONMENT_STARTNG_MAX_WAITING_MILISECONDS
  );
};

export function navigateToCreateEnvironment(): void {
  cy.visit('/environments');
  cy.get('[data-testid="environmentListHeader"]').contains('Workspaces').should('be.visible');
  cy.get('[data-testid="environmentCreate"]').click();
  cy.get('[data-testid="environmentCreateHeader"]').should('be.visible');
  cy.get('[data-testid="environmentCreateSubmit"]').should('be.disabled');
}

export function excecuteEnvironmentAction(
  environmentName: string,
  action: 'START' | 'STOP' | 'CONNECT' | 'TERMINATE'
): void {
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

export function connectEnvironment(environmentName: string): void {
  selectItemGrid(ENVIRONMENT_TABLE_DATA_TEST_ID, environmentName);
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
          selectItemGrid(ENVIRONMENT_TABLE_DATA_TEST_ID, environmentName); //deselect
        });
    });
}

export function stopEnvironment(environmentName: string): void {
  selectItemGrid(ENVIRONMENT_TABLE_DATA_TEST_ID, environmentName);
  cy.get('[data-testid="environmentStop"]').should('be.enabled');
  cy.get('[data-testid="environmentStop"]').click();
  validateTableData(ENVIRONMENT_TABLE_DATA_TEST_ID, environmentName, 'Workspace status', 'STOPPING');
}

export function startEnvironment(environmentName: string): void {
  selectItemGrid(ENVIRONMENT_TABLE_DATA_TEST_ID, environmentName);
  cy.get('[data-testid="environmentConnect"]').should('be.disabled');
  cy.get('[data-testid="environmentStop"]').should('be.disabled');
  cy.get('[data-testid="environmentStart"]').should('be.enabled');
  cy.get('[data-testid="environmentTerminate"]').should('be.enabled');
  cy.get('[data-testid="environmentStart"]').click();
  validateTableData(ENVIRONMENT_TABLE_DATA_TEST_ID, environmentName, 'Workspace status', 'STARTING');
}

export function terminateEnvironment(environmentName: string): void {
  selectItemGrid(ENVIRONMENT_TABLE_DATA_TEST_ID, environmentName);
  cy.get('[data-testid="environmentTerminate"]').click();
  validateTableData(ENVIRONMENT_TABLE_DATA_TEST_ID, environmentName, 'Workspace status', 'TERMINATING');
}

/*******************************************************************************************************************************************************************
 * This function will try to move all environments one step closer to termination
 * e.g.
 * COMPLETED EnvironmentA will be STOPPED
 * STOPPED EnvironmentB will be TERMINATED
 * FAILED EnvironmentC will be TERMINATED
 *
 * If an environment fails to terminate or stop, excecution will continue as cleanup is not required for e2e tests to run
 * Environments in PENDING, STARTING, STOPPING and TERMINATING status will be ignored to speed up e2e testing
 *******************************************************************************************************************************************************************/
export function cleanupEnvironments(): void {
  // eslint-disable-next-line security/detect-unsafe-regex
  cy.contains(`[data-testid="${ENVIRONMENT_TABLE_DATA_TEST_ID}"] th`, new RegExp('^Workspace name$'))
    .invoke('index')
    .then((nameIndex: number) => {
      // eslint-disable-next-line security/detect-unsafe-regex
      cy.contains(`[data-testid="${ENVIRONMENT_TABLE_DATA_TEST_ID}"] th`, new RegExp('^Workspace status$'))
        .invoke('index')
        .then((statusIndex) => {
          const envNames = Cypress.$(
            `[data-testid="${ENVIRONMENT_TABLE_DATA_TEST_ID}"] tr td:nth-child(${nameIndex + 1})`
          );
          envNames.each((index, item) => {
            cleanupEnvironmentRow(statusIndex + 1, item.textContent || '');
          });
        });
    });
}

function cleanupEnvironmentRow(statusIndex: number, envName: string): void {
  cy.wait(DEFLAKE_DELAY_IN_MILLISECONDS); //avoid throttle
  const currentEnv = Cypress.$(
    `[data-testid="${ENVIRONMENT_TABLE_DATA_TEST_ID}"] tr:has(div[data-testid="${envName}"]) td[class^="awsui_selection-contro"]`
  ); //make sure row still exists in case is terminating
  if (currentEnv.length === 0) return;
  selectItemGrid(ENVIRONMENT_TABLE_DATA_TEST_ID, envName);
  cy.get(
    `[data-testid="${ENVIRONMENT_TABLE_DATA_TEST_ID}"] tr:has(div[data-testid="${envName}"]) td:nth-child(${statusIndex})`
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
  clickSelectAllGrid(ENVIRONMENT_TABLE_DATA_TEST_ID); //reset selection with select all deselect all
  clickSelectAllGrid(ENVIRONMENT_TABLE_DATA_TEST_ID);
}
