/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const getRandomNumberAsString = (): string => {
  const num = Math.round(Math.random() * 1000) + 1;
  return num.toString();
};

export const escapeRegex = (expression: string): string => {
  return expression.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
export const getFakeText = (text: string): string => {
  return `${text}-${new Date().getTime()}-${getRandomNumberAsString()}`;
};

export function selectItemCard(componentTestId: string, itemToSelect: string): void {
  cy.get(`[data-testid="${componentTestId}"]`).should('be.visible');
  cy.get(`[data-testid="${itemToSelect}"]`).should('be.visible');
  cy.get(
    `[data-testid="${componentTestId}"] span[class^="awsui_card-header"]:has(div[data-testid="${itemToSelect}"])~div[class^="awsui_selection-control"]`
  ).click();
}

export function selectItemDropDown(
  componentTestId: string,
  itemsToSelect: string[],
  closeAfterSelection: boolean = false
): void {
  cy.get(`[data-testid="${componentTestId}"] button`).click();
  itemsToSelect.forEach((item): void => {
    const itemRegex = `^${escapeRegex(item)}$`;
    cy.get(`[data-testid="${componentTestId}"]`)
      // eslint-disable-next-line security/detect-unsafe-regex, security/detect-non-literal-regexp, @rushstack/security/no-unsafe-regexp
      .contains(new RegExp(itemRegex))
      .click();
  });
  if (closeAfterSelection) cy.focused().blur();
}

export function selectItemGrid(componentTestId: string, itemToSelect: string): void {
  cy.get(
    `[data-testid="${componentTestId}"] tr:has(div[data-testid="${itemToSelect}"]) td[class^="awsui_selection-contro"]:first`
  ).click();
}

/*******************************************************************************************************************************************************************
 * This function validates if a polaris table contains a column with specified header name, a row with specified data-testid and column value.
 * If column with value is not found within timeout it will throw a cypress validation error
 *
 * @param componentTestId -  Data-testId attribute from Table
 * @param rowTestId -  Data-testId attribute from row
 * @param columnToVerify - Name of column to validate
 * @param valueToVerify -  Value of columnt to validate
 * @param timeoutInMiliseconds -  Time limit in miliseconds to find value
 *******************************************************************************************************************************************************************/
export function validateTableData(
  componentTestId: string,
  rowTestId: string,
  columnToVerify: string,
  valueToVerify: string,
  timeoutInMiliseconds?: number
): void {
  const columnNameRegex = `^${escapeRegex(columnToVerify)}$`;
  const columnValueRegex = `^${escapeRegex(valueToVerify)}$`;
  // eslint-disable-next-line security/detect-non-literal-regexp, @rushstack/security/no-unsafe-regexp
  cy.contains(`[data-testId="${componentTestId}"] th`, new RegExp(columnNameRegex))
    .invoke('index')
    .then((i) => {
      cy.contains(
        `[data-testid="${componentTestId}"] tr:has(div[data-testid="${rowTestId}"]) td:nth-child(${i + 1})`,
        // eslint-disable-next-line security/detect-unsafe-regex, security/detect-non-literal-regexp, @rushstack/security/no-unsafe-regexp
        new RegExp(columnValueRegex),
        { timeout: timeoutInMiliseconds }
      );
    });
}

export function clickSelectAllGrid(componentTestId: string): void {
  cy.get(`[data-testid="${componentTestId}"] thead th:first`).click();
}
