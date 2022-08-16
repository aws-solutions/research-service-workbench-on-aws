/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useCollection } from '@awsui/collection-hooks';
import {
  Box,
  BreadcrumbGroupProps,
  CollectionPreferences,
  DateRangePicker,
  DateRangePickerProps,
  Header,
  Pagination,
  PaginationProps,
  PropertyFilter,
  SpaceBetween,
  Table,
  StatusIndicator
} from '@awsui/components-react';
import { FlashbarProps } from '@awsui/components-react/flashbar';

import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { SetStateAction, useEffect, useState } from 'react';
import { useDatasets } from '../../api/datasets';
import { datei18nStrings, relativeOptions } from '../../common/dateRelativeOptions';
import { convertToAbsoluteRange, isValidRangeFunction } from '../../common/dateRelativeProperties';
import { i18nStrings, paginationLables } from '../../common/labels';

import { getFilterCounterText } from '../../common/tableCounterStrings';
import { TableEmptyDisplay } from '../../common/tableEmptyState';
import { TableNoMatchDisplay } from '../../common/tableNoMatchState';
import BaseLayout from '../../components/BaseLayout';
import EnvironmentConnectModal from '../../components/EnvironmentConnectModal';
import { useNotifications } from '../../context/NotificationContext';
import {
  columnDefinitions,
  searchableColumns
} from '../../datasets-table-config/workspacesColumnDefinitions';
import { filteringOptions } from '../../datasets-table-config/workspacesFilteringOptions';
import { filteringProperties } from '../../datasets-table-config/workspacesFilteringProperties';
import { EnvironmentConnectResponse, EnvironmentsTableFilter } from '../../models/Environment';

const Dataset: NextPage = () => {
  // For functions to return content specific to the table
  const itemType: string = 'dataset';
  // App settings constant

  const pageSizeOptions = [
    { label: '20', value: 20 },
    { label: '30', value: 30 },
    { label: '50', value: 50 }
  ];
  const [filterParams, setFilterParams] = useState<EnvironmentsTableFilter>({
    paginationToken: '',
    pageSize: pageSizeOptions[0]?.value,
    descending: 'createdAt',
    currentPageIndex: 1,
    paginationTokens: new Map<number, string>().set(1, ''),
    hasOpenEndPagination: true,
    pageCount: 1
  });
  const { datasets, areDatasetsLoading } = useDatasets();
  const [error] = useState('');
  const router = useRouter();
  const { message, notificationType } = router.query;
  const { displayNotification, closeNotification } = useNotifications();

  const [hasInitialNotificationBeenShown, setHasInitialNotificationBeenShown] = useState(false);
  if (!!message && !!notificationType && !hasInitialNotificationBeenShown) {
    const envMessageId = 'EnvironmentMessage';
    const notification = {
      type: notificationType as FlashbarProps.Type,
      dismissible: true,
      dismissLabel: 'Dismiss message',
      onDismiss: () => {
        closeNotification(envMessageId);
      },
      content: message,
      id: envMessageId
    };
    displayNotification(envMessageId, notification);
    setHasInitialNotificationBeenShown(true);
  }

  // App layout constants
  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    {
      text: 'Service Workbench',
      href: '/'
    },
    {
      text: 'Datasets',
      href: '/datasets'
    }
  ];

  // Date filter constants
  const [dateFilter, setDateFilter] = React.useState<DateRangePickerProps.RelativeValue | null>(null);

  // Property and date filter collections
  const { items, filteredItemsCount, collectionProps, propertyFilterProps } = useCollection(datasets, {
    filtering: {
      empty: TableEmptyDisplay(itemType),
      noMatch: TableNoMatchDisplay(itemType),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteringFunction: (item: any, filteringText): any => {
        const filteringTextLowerCase = filteringText.toLowerCase();

        return (
          searchableColumns
            // eslint-disable-next-line security/detect-object-injection
            .map((key) => item[key])
            .some(
              (value) => typeof value === 'string' && value.toLowerCase().indexOf(filteringTextLowerCase) > -1
            )
        );
      }
    },
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty: TableEmptyDisplay(itemType),
      noMatch: TableNoMatchDisplay(itemType)
    },

    sorting: {},
    selection: {}
  });

  const [showConnectEnvironmentModal, setShowConnectEnvironmentModal] = useState<boolean>(false);
  const [envConnectResponse] = useState<EnvironmentConnectResponse>({
    instructionResponse: '',
    authCredResponse: {}
  });

  const onPaginationChange = (detail: PaginationProps.ChangeDetail): void => {
    //when clicking next page, this will check if there are more pages to load, if not, disable next button and go back to previous page
    if (!filterParams.paginationTokens.get(detail.currentPageIndex) && detail.currentPageIndex > 1) {
      setFilterParams((prevState) => ({
        ...prevState,
        currentPageIndex: detail.currentPageIndex - 1,
        hasOpenEndPagination: false
      }));
      return;
    }
    //get previously saved token of page clicked
    const paginationToken = filterParams.paginationTokens.get(detail.currentPageIndex) || '';

    //update pages shown in pagination if we discover a new page and set current page
    setFilterParams((prevState) => ({
      ...prevState,
      pageCount:
        detail.currentPageIndex > prevState.pageCount ? detail.currentPageIndex : prevState.pageCount,
      currentPageIndex: detail.currentPageIndex,
      paginationToken: paginationToken
    }));
  };
  const onSortingChange = (isDescending: boolean | undefined, sortingField: string | undefined): void => {
    setDateFilter(null);
    setFilterParams((prevState) => ({
      ...prevState,
      ascending: isDescending ? undefined : sortingField,
      descending: isDescending ? sortingField : undefined,
      paginationToken: undefined,
      createdAtFrom: undefined,
      createdAtTo: undefined,
      currentPageIndex: 1,
      paginationTokens: new Map<number, string>().set(1, ''),
      hasOpenEndPagination: true,
      pageCount: 1
    }));
  };

  const onDateFilterChange = (dateFilterValue: DateRangePickerProps.RelativeValue): void => {
    let start: Date | undefined = undefined;
    let end: Date | undefined = undefined;
    setDateFilter(dateFilterValue);
    if (dateFilterValue) {
      const range = convertToAbsoluteRange(dateFilterValue);
      start = range.start;
      end = range.end;
    }
    setFilterParams((prevState) => ({
      ...prevState,
      ascending: undefined,
      descending: undefined,
      paginationToken: undefined,
      createdAtFrom: start?.toISOString(),
      createdAtTo: end?.toISOString(),
      currentPageIndex: 1,
      paginationTokens: new Map<number, string>().set(1, ''),
      hasOpenEndPagination: true,
      pageCount: 1
    }));
  };

  const onConfirmPageSize = (pageSize: number | undefined): void => {
    setFilterParams((prevState) => ({
      ...prevState,
      pageSize: pageSize || pageSizeOptions[0]?.value,
      paginationToken: undefined,
      currentPageIndex: 1,
      paginationTokens: new Map<number, string>().set(1, ''),
      hasOpenEndPagination: true,
      pageCount: 1
    }));
  };

  useEffect(() => {
    //save next page token into dictionary so we can access previous or next page by directly clicking page number
    setFilterParams((prevState) => ({
      ...prevState
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getContent = (): JSX.Element => {
    return (
      <Box>
        {showConnectEnvironmentModal && (
          <EnvironmentConnectModal
            closeModal={() => {
              setShowConnectEnvironmentModal(false);
            }}
            instructions={envConnectResponse.instructionResponse}
            authCredResponse={envConnectResponse.authCredResponse}
          />
        )}
        {!!error && <StatusIndicator type="error">{error}</StatusIndicator>}
        <Table
          {...collectionProps}
          sortingDescending={!!filterParams.descending}
          sortingColumn={{ sortingField: filterParams.descending || filterParams.ascending }}
          onSortingChange={(event) =>
            onSortingChange(event.detail.isDescending, event.detail.sortingColumn.sortingField)
          }
          loading={areDatasetsLoading}
          selectionType="multi"
          selectedItems={collectionProps.selectedItems}
          ariaLabels={{
            selectionGroupLabel: 'Items selection',
            allItemsSelectionLabel: ({ selectedItems }) =>
              `${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'} selected`,
            itemSelectionLabel: ({ selectedItems }, item) => {
              const isItemSelected = selectedItems.filter((i) => i.dataset === item.dataset).length;
              return `${item.dataset} is ${isItemSelected ? '' : 'not'} selected`;
            }
          }}
          header={
            <>
              <Header
                actions={
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                    </SpaceBetween>
                  </Box>
                }
              >
                Datasets
              </Header>
            </>
          }
          columnDefinitions={columnDefinitions}
          loadingText="Loading datasets"
          filter={
            <SpaceBetween direction="vertical" size="xs">
              <PropertyFilter
                {...propertyFilterProps}
                countText={getFilterCounterText(filteredItemsCount)}
                i18nStrings={i18nStrings}
                filteringOptions={filteringOptions}
                expandToViewport={true}
              />
              <DateRangePicker
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={({ detail }: SetStateAction<any>) => onDateFilterChange(detail.value)}
                value={dateFilter}
                relativeOptions={relativeOptions}
                i18nStrings={datei18nStrings}
                placeholder="Filter by a date and time range"
                isValidRange={isValidRangeFunction}
              />
            </SpaceBetween>
          }
          pagination={
            <Pagination
              disabled={areDatasetsLoading}
              pagesCount={filterParams.pageCount}
              currentPageIndex={filterParams.currentPageIndex}
              onChange={({ detail }) => onPaginationChange(detail)}
              openEnd={filterParams.hasOpenEndPagination}
              ariaLabels={paginationLables}
            />
          }
          preferences={
            <CollectionPreferences
              title="Preferences"
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              preferences={{ pageSize: filterParams.pageSize }}
              onConfirm={({ detail: { pageSize } }) => onConfirmPageSize(pageSize)}
              pageSizePreference={{
                title: 'Page size',
                options: pageSizeOptions
              }}
            />
          }
          items={items}
        />
      </Box>
    );
  };
  return (
    <BaseLayout breadcrumbs={breadcrumbs} activeHref="/datasets">
      {getContent()}
    </BaseLayout>
  );
};

export default Dataset;
