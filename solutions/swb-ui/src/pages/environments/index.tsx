/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useCollection } from '@awsui/collection-hooks';
import {
  Box,
  BreadcrumbGroupProps,
  Button,
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
import { useEnvironments, terminate, start, stop, connect } from '../../api/environments';
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
} from '../../environments-table-config/workspacesColumnDefinitions';
import { filteringOptions } from '../../environments-table-config/workspacesFilteringOptions';
import { filteringProperties } from '../../environments-table-config/workspacesFilteringProperties';
import { EnvironmentConnectResponse, EnvironmentsTableFilter } from '../../models/Environment';

const Environment: NextPage = () => {
  // For functions to return content specific to the table
  const itemType: string = 'workspace';
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
  const { environments, mutate, paginationToken, areEnvironmentsLoading } = useEnvironments({
    ascending: filterParams.ascending,
    createdAtFrom: filterParams.createdAtFrom,
    createdAtTo: filterParams.createdAtTo,
    descending: filterParams.descending,
    pageSize: filterParams.pageSize,
    paginationToken: filterParams.paginationToken
  });
  const [error, setError] = useState('');
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
      text: 'Workspaces',
      href: '/environments'
    }
  ];

  // Date filter constants
  const [dateFilter, setDateFilter] = React.useState<DateRangePickerProps.RelativeValue | null>(null);

  // Property and date filter collections
  const { items, filteredItemsCount, collectionProps, propertyFilterProps } = useCollection(environments, {
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

  // Action button constants
  // Constant buttons should be enabled based on statuses in the array
  const connectButtonEnableStatuses: string[] = ['AVAILABLE', 'STARTED', 'COMPLETED'];
  const startButtonEnableStatuses: string[] = ['STOPPED'];
  const stopButtonEnableStatuses: string[] = ['AVAILABLE', 'STARTED', 'COMPLETED'];
  const terminateButtonEnableStatuses: string[] = ['FAILED', 'STOPPED'];
  // Constant buttons should show loading based on statuses in the array
  const stopButtonLoadingStatuses: string[] = ['STOPPING'];
  const terminateButtonLoadingStatuses: string[] = ['TERMINATING'];
  const startButtonLoadingStatuses: string[] = ['STARTING'];
  const [terminatingIds, setTerminatingIds] = useState(new Set<string>());
  const [stoppingIds, setStoppingIds] = useState(new Set<string>());

  const [startingIds, setstartingIds] = useState(new Set<string>());
  const [showConnectEnvironmentModal, setShowConnectEnvironmentModal] = useState<boolean>(false);
  const [isLoadingEnvConnection, setIsLoadingEnvConnection] = useState<boolean>(false);
  const [envConnectResponse, setEnvConnectResponse] = useState<EnvironmentConnectResponse>({
    instructionResponse: '',
    authCredResponse: {}
  });

  const isOneItemSelected = (): boolean | undefined => {
    return collectionProps.selectedItems && collectionProps.selectedItems.length === 1;
  };
  const getEnvironmentStatus = (): string => {
    const selectedItems = collectionProps.selectedItems;
    if (selectedItems !== undefined && isOneItemSelected()) {
      return collectionProps.selectedItems?.at(0).workspaceStatus;
    }
    return '';
  };

  const getSelectedId = (): string => {
    if (isOneItemSelected()) {
      return collectionProps.selectedItems?.at(0).id;
    }
    return '';
  };

  const executeAction = async (action: string): Promise<void> => {
    let actionLabel = 'Retrieve Workspaces Data';
    if (isOneItemSelected()) {
      const id = collectionProps.selectedItems?.at(0).id;
      try {
        setError('');
        switch (action) {
          case 'TERMINATE':
            setTerminatingIds((prev) => new Set(prev.add(id)));
            actionLabel = 'Terminate Workspace';
            await terminate(id);
            break;
          case 'STOP':
            setStoppingIds((prev) => new Set(prev.add(id)));
            actionLabel = 'Stop Workspace';
            await stop(id);
            break;
          case 'START':
            setstartingIds((prev) => new Set(prev.add(id)));
            actionLabel = 'Start Workspace';
            await start(id);
            break;
          case 'CONNECT':
            const connectingEnvId = collectionProps.selectedItems ? collectionProps.selectedItems[0].id : '';
            setIsLoadingEnvConnection(true);
            const response = await connect(connectingEnvId);
            setEnvConnectResponse(response);
            setIsLoadingEnvConnection(false);
            actionLabel = 'Connect to Workspace';
            setShowConnectEnvironmentModal(true);
            break;
        }
        await mutate();
      } catch {
        setError(`There was a problem trying to ${actionLabel}.`);
      } finally {
        setTerminatingIds((prev) => {
          prev.delete(id);
          return new Set(prev);
        });
        setStoppingIds((prev) => {
          prev.delete(id);
          return new Set(prev);
        });

        setstartingIds((prev) => {
          prev.delete(id);
          return new Set(prev);
        });
      }
    }
  };

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
      ...prevState,
      paginationTokens: prevState.paginationTokens.set(prevState.currentPageIndex + 1, paginationToken)
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationToken]);

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
          loading={areEnvironmentsLoading}
          selectionType="multi"
          selectedItems={collectionProps.selectedItems}
          ariaLabels={{
            selectionGroupLabel: 'Items selection',
            allItemsSelectionLabel: ({ selectedItems }) =>
              `${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'} selected`,
            itemSelectionLabel: ({ selectedItems }, item) => {
              const isItemSelected = selectedItems.filter((i) => i.workspace === item.workspace).length;
              return `${item.workspace} is ${isItemSelected ? '' : 'not'} selected`;
            }
          }}
          header={
            <>
              <Header
                actions={
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        disabled={
                          !connectButtonEnableStatuses.includes(getEnvironmentStatus()) ||
                          (collectionProps.selectedItems && collectionProps.selectedItems.length > 1)
                        }
                        loading={isLoadingEnvConnection}
                        onClick={() => executeAction('CONNECT')}
                      >
                        Connect
                      </Button>
                      <Button
                        disabled={
                          !startButtonEnableStatuses.includes(getEnvironmentStatus()) ||
                          startingIds.has(getSelectedId())
                        }
                        loading={
                          startButtonLoadingStatuses.includes(getEnvironmentStatus()) ||
                          startingIds.has(getSelectedId())
                        }
                        onClick={() => executeAction('START')}
                      >
                        Start
                      </Button>
                      <Button
                        disabled={
                          !stopButtonEnableStatuses.includes(getEnvironmentStatus()) ||
                          stoppingIds.has(getSelectedId())
                        }
                        loading={
                          stopButtonLoadingStatuses.includes(getEnvironmentStatus()) ||
                          stoppingIds.has(getSelectedId())
                        }
                        onClick={() => executeAction('STOP')}
                      >
                        Stop
                      </Button>
                      <Button
                        disabled={
                          !terminateButtonEnableStatuses.includes(getEnvironmentStatus()) ||
                          terminatingIds.has(getSelectedId())
                        }
                        loading={
                          terminateButtonLoadingStatuses.includes(getEnvironmentStatus()) ||
                          terminatingIds.has(getSelectedId())
                        }
                        onClick={() => executeAction('TERMINATE')}
                      >
                        Terminate
                      </Button>
                      <Button variant="primary" href="/environments/new">
                        Create Workspace
                      </Button>
                    </SpaceBetween>
                  </Box>
                }
              >
                Workspaces
              </Header>
            </>
          }
          columnDefinitions={columnDefinitions}
          loadingText="Loading workspaces"
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
              disabled={areEnvironmentsLoading}
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
    <BaseLayout breadcrumbs={breadcrumbs} activeHref="/environments">
      {getContent()}
    </BaseLayout>
  );
};

export default Environment;
