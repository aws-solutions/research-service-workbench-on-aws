/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCollection } from '@awsui/collection-hooks';
import {
  AppLayout,
  Box,
  BreadcrumbGroup,
  BreadcrumbGroupProps,
  Button,
  DateRangePicker,
  DateRangePickerProps,
  Header,
  Pagination,
  PropertyFilter,
  PropertyFilterProps,
  SpaceBetween,
  SplitPanel,
  Table,
  StatusIndicator,
  Flashbar,
  FlashbarProps
} from '@awsui/components-react';
import { isWithinInterval } from 'date-fns';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { SetStateAction, useEffect, useState } from 'react';
import { useEnvironments, terminate, start, stop, connect } from '../../api/environments';
import { datei18nStrings, relativeOptions } from '../../common/dateRelativeOptions';
import { convertToAbsoluteRange, isValidRangeFunction } from '../../common/dateRelativeProperties';
import { i18nStrings, paginationLables, layoutLabels } from '../../common/labels';
import { getPanelContent, splitPaneli18nstrings, useSplitPanel } from '../../common/splitPanel';
import { getFilterCounterText } from '../../common/tableCounterStrings';
import { TableEmptyDisplay } from '../../common/tableEmptyState';
import { TableNoMatchDisplay } from '../../common/tableNoMatchState';
import ConnectEnvironmentModal from '../../components/ConnectEnvironmentModal';
import Navigation from '../../components/Navigation';
import { useSettings } from '../../context/SettingsContext';
import {
  columnDefinitions,
  searchableColumns
} from '../../environments-table-config/workspacesColumnDefinitions';
import { filteringOptions } from '../../environments-table-config/workspacesFilteringOptions';
import { filteringProperties } from '../../environments-table-config/workspacesFilteringProperties';
import { EnvironmentConnectResponse } from '../../models/Environment';

export interface EnvironmentProps {
  locale: string;
}

const Environment: NextPage = () => {
  // For functions to return content specific to the table
  const itemType: string = 'workspace';
  // App settings constant
  const { settings } = useSettings();
  const [preferences] = useState({
    pageSize: 20
  });
  const { environments, mutate } = useEnvironments();

  const [error, setError] = useState('');
  const router = useRouter();
  const { message, notificationType } = router.query;
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
  // eslint-disable-next-line prefer-const
  let [navigationOpen, setNavigationOpen] = useState(false);

  // Property filter constants
  const [workspaces, setWorkspaces] = useState<PropertyFilterProps.Query>({
    tokens: [],
    operation: 'and'
  });

  // Date filter constants
  const [dateFilter, setDateFilter] = React.useState<DateRangePickerProps.RelativeValue | null>(null);
  const initialNotifications =
    !!message && !!notificationType
      ? [
          {
            type: notificationType as FlashbarProps.Type,
            dismissible: true,
            dismissLabel: 'Dismiss message',
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            onDismiss: () => setNotifications([]),
            content: message,
            id: 'message_0'
          }
        ]
      : [];
  const [notifications, setNotifications] = useState<FlashbarProps.MessageDefinition[]>(initialNotifications);

  useEffect(() => {
    setDateFilter(dateFilter);
  }, [dateFilter]);

  // Property and date filter collections
  const { items, filteredItemsCount, collectionProps, filterProps, paginationProps, propertyFilterProps } =
    useCollection(environments, {
      filtering: {
        empty: TableEmptyDisplay(itemType),
        noMatch: TableNoMatchDisplay(itemType),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteringFunction: (item: any, filteringText): any => {
          if (dateFilter !== null) {
            const range = convertToAbsoluteRange(dateFilter);
            if (!isWithinInterval(new Date(item.createdAt), range)) {
              return false;
            }
          }

          const filteringTextLowerCase = filteringText.toLowerCase();

          return (
            searchableColumns
              // eslint-disable-next-line security/detect-object-injection
              .map((key) => item[key])
              .some(
                (value) =>
                  typeof value === 'string' && value.toLowerCase().indexOf(filteringTextLowerCase) > -1
              )
          );
        }
      },
      propertyFiltering: {
        filteringProperties: filteringProperties,
        empty: TableEmptyDisplay(itemType),
        noMatch: TableNoMatchDisplay(itemType)
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: {},
      selection: {}
    });
  useEffect(() => {
    setWorkspaces(workspaces);
  }, [workspaces]);

  // Action button constants
  // Constant buttons should be enabled based on statuses in the array
  const connectButtonEnableStatuses: string[] = ['AVAILABLE', 'STARTED', 'COMPLETED'];
  const startButtonEnableStatuses: string[] = ['STOPPED'];
  const stopButtonEnableStatuses: string[] = ['AVAILABLE', 'STARTED', 'COMPLETED'];
  const terminateButtonEnableStatuses: string[] = ['FAILED', 'STOPPED', 'COMPLETED'];
  // Constant buttons should show loading based on statuses in the array
  const stopButtonLoadingStatuses: string[] = ['STOPPING'];
  const terminateButtonLoadingStatuses: string[] = ['TERMINATING'];
  const startButtonLoadingStatuses: string[] = ['STARTING'];
  const [terminatingIds, setTerminatingIds] = useState(new Set<string>());
  const [stoppingIds, setStoppingIds] = useState(new Set<string>());
  const [startingIds, setstartingIds] = useState(new Set<string>());
  const [showConnectEnvironmentModalVisible, setShowConnectEnvironmentModalVisible] =
    useState<boolean>(false);
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
      const status = collectionProps.selectedItems?.at(0).workspaceStatus;
      return status;
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
            console.log('connectingEnvId', connectingEnvId);
            setIsLoadingEnvConnection(true);
            const response = await connect(connectingEnvId);
            setEnvConnectResponse(response);
            setIsLoadingEnvConnection(false);
            actionLabel = 'Connect to Workspace';
            setShowConnectEnvironmentModalVisible(true);
            //TODO: implement Connect workflow
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

  return (
    <AppLayout
      id="environments-layout"
      headerSelector="#header"
      stickyNotifications
      toolsHide
      ariaLabels={layoutLabels}
      navigationOpen={navigationOpen}
      navigation={<Navigation activeHref="#/" />}
      breadcrumbs={
        <BreadcrumbGroup items={breadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
      }
      contentType="table"
      onNavigationChange={({ detail }) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        setNavigationOpen(detail.open);
        navigationOpen = true;
      }}
      content={
        <>
          {showConnectEnvironmentModalVisible && (
            <ConnectEnvironmentModal
              closeModal={() => {
                setShowConnectEnvironmentModalVisible(false);
              }}
              instructions={envConnectResponse.instructionResponse}
              authCredResponse={envConnectResponse.authCredResponse}
            />
          )}

          <Box margin={{ bottom: 'l' }}>
            <Flashbar items={notifications} />
            <Head>
              <title>{settings.name}</title>
              <link rel="icon" href={settings.favicon} />
            </Head>
            {!!error && <StatusIndicator type="error">{error}</StatusIndicator>}
            <Table
              {...collectionProps}
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
                    counter={
                      collectionProps.selectedItems?.length
                        ? `(${collectionProps.selectedItems.length}/${environments.length})`
                        : `(${environments.length})`
                    }
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
                <>
                  <PropertyFilter
                    {...propertyFilterProps}
                    countText={getFilterCounterText(filteredItemsCount)}
                    i18nStrings={i18nStrings}
                    filteringOptions={filteringOptions}
                    expandToViewport={true}
                  />
                  <DateRangePicker
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={({ detail }: SetStateAction<any>) => setDateFilter(detail.value)}
                    value={dateFilter}
                    relativeOptions={relativeOptions}
                    i18nStrings={datei18nStrings}
                    placeholder="Filter by a date and time range"
                    isValidRange={isValidRangeFunction}
                  />
                </>
              }
              pagination={<Pagination {...paginationProps} ariaLabels={paginationLables} />}
              items={items}
            />
          </Box>
        </>
      }
    ></AppLayout>
  );
};

export default Environment;
