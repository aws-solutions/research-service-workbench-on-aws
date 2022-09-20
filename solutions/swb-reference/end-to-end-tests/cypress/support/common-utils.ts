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

export function verifyDataGtid(
  componentTestId: string,
  rowTestId: string,
  columnToVerify: string,
  valueToVerify: string,
  timeoutInMiliseconds?: number
) {
  cy.contains('th', new RegExp(`^${columnToVerify}$`))
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
