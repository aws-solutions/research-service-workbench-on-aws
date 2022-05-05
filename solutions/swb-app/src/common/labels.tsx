// const for column sort fuction, so not exported
const headerLabel = (title: string, sorted: boolean, descending: boolean) => {
  return `${title}, ${sorted ? `sorted ${descending ? 'descending' : 'ascending'}` : 'not sorted'}.`;
};

export const addColumnSortLabels = (columns: any[]) =>
  columns.map((col) => ({
    ariaLabel: col.sortingField
      ? (sortState: { sorted: boolean; descending: boolean }) =>
          headerLabel(col.header, sortState.sorted, sortState.descending)
      : undefined,
    ...col
  }));

// i18nStrings labels for <PropertyFilter>
export const i18nStrings = {
  filteringAriaLabel: 'your choice',
  dismissAriaLabel: 'Dismiss',
  filteringPlaceholder: 'Search',
  groupValuesText: 'Values',
  groupPropertiesText: 'Properties',
  operatorsText: 'Operators',
  operationAndText: 'and',
  operationOrText: 'or',
  operatorLessText: 'Less than',
  operatorLessOrEqualText: 'Less than or equal to',
  operatorGreaterText: 'Greater than',
  operatorGreaterOrEqualText: 'Greater than or equal to',
  operatorContainsText: 'Contains',
  operatorDoesNotContainText: 'Does not contain',
  operatorEqualsText: 'Equals',
  operatorDoesNotEqualText: 'Does not equal',
  editTokenHeader: 'Edit filter',
  propertyText: 'Property',
  operatorText: 'Operator',
  valueText: 'Value',
  cancelActionText: 'Cancel',
  applyActionText: 'Apply',
  allPropertiesLabel: 'All properties',
  tokenLimitShowMore: 'Show more',
  tokenLimitShowFewer: 'Show fewer',
  clearFiltersText: 'Clear filters',
  removeTokenButtonAriaLabel: () => 'Remove token',
  enteredTextLabel: (text: any) => `Use: "${text}"`
};

export const paginationLables = {
  nextPageLabel: 'Next page',
  previousPageLabel: 'Previous page',
  pageLabel: (pageNumber: number) => `Page ${pageNumber} of all pages`
};
