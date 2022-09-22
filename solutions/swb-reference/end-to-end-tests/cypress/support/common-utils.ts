/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export const getFakeText = (text: string): string => {
  return `${text}-${new Date().getTime()}-${getRandomNumberAsString()}`;
};

const getRandomNumberAsString = (): string => {
  const num = Math.round(Math.random() * 1000) + 1;
  return num.toString();
};

export function selectItemCard(componentTestId: string, itemToSelect: string) {
  cy.get(`[data-testid="${componentTestId}"]`).should('be.visible');
  cy.get(`[data-testid="${itemToSelect}"]`).should('be.visible');
  cy.get(
    `[data-testid="${componentTestId}"] span[class^="awsui_card-header"]:has(div[data-testid="${itemToSelect}"])~div[class^="awsui_selection-control"]`
  ).click();
}

export function selectItemDropDown(componentTestId: string, itemsToSelect: string[]) {
  cy.get(`[data-testid="${componentTestId}"] button`).click();
  itemsToSelect.forEach((item) => {
    cy.get(`[data-testid="${componentTestId}"]`)
      .contains(new RegExp(`^${item}$`))
      .click();
  });
}

export function selectItemGrid(componentTestId: string, itemToSelect: string) {
  cy.get(
    `[data-testid="${componentTestId}"] tr:has(div[data-testid="${itemToSelect}"]) td[class^="awsui_selection-contro"]:first`
  ).click();
}

/*******************************************************************************************************************************************************************
 * This function validates if a polaris table contains a column with specified header name, a row with specified data-testid and column value.
 * If column with value is not found within timeout it will throw a cypress validation error
 *
 * @param {string} componentTestId Data-testId attribute from Table
 * @param {string} rowTestId Data-testId attribute from row
 * @param {string} columnToVerify Name of column to validate
 * @param {string} valueToVerify Value of columnt to validate
 * @param {number} timeoutInMiliseconds Time limit in miliseconds to find value
 *******************************************************************************************************************************************************************/
export function validateTableData(
  componentTestId: string,
  rowTestId: string,
  columnToVerify: string,
  valueToVerify: string,
  timeoutInMiliseconds?: number
) {
  cy.contains(`[data-testId="${componentTestId}"] th`, new RegExp(`^${columnToVerify}$`))
    .invoke('index')
    .then((i) => {
      cy.contains(
        `[data-testid="${componentTestId}"] tr:has(div[data-testid="${rowTestId}"]) td:nth-child(${i + 1})`,
        new RegExp(`^${valueToVerify}$`),
        { timeout: timeoutInMiliseconds }
      );
    });
}

export function clickSelectAllGrid(componentTestId: string) {
  cy.get(`[data-testid="${componentTestId}"] thead th:first`).click();
}
