/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextPage } from 'next';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { TableNoMatchDisplay } from '../common/tableNoMatchState';
import Head from 'next/head';
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
  Table
} from '@awsui/components-react';
import { useCollection } from '@awsui/collection-hooks';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSettings } from '../context/SettingsContext';
import { SetStateAction, useEffect, useState } from 'react';
import React from 'react';
import { i18nStrings, paginationLables } from '../common/labels';
import { allItems } from '../environments-table-config/workspacesData';
import {
  columnDefinitions,
  searchableColumns
} from '../environments-table-config/workspacesColumnDefinitions';
import { getFilterCounterText } from '../common/tableCounterStrings';
import { filteringOptions } from '../environments-table-config/workspacesFilteringOptions';
import { filteringProperties } from '../environments-table-config/workspacesFilteringProperties';
import { datei18nStrings, relativeOptions } from '../common/dateRelativeOptions';
import { convertToAbsoluteRange, isValidRangeFunction } from '../common/dateRelativeProperties';
import { isWithinInterval } from 'date-fns';
import Navigation from '../components/Navigation';
import { layoutLabels } from '../common/labels';
import styles from '../styles/BaseLayout.module.scss';
import { getPanelContent, splitPaneli18nstrings, useSplitPanel } from '../common/splitPanel';

export interface EnvironmentProps {
  locale: string;
}

export const getServerSideProps = async ({ locale }: EnvironmentProps): Promise<unknown> => ({
  props: {
    ...(await serverSideTranslations(locale, ['common']))
  }
});

const Environment: NextPage = () => {
  // For functions to return content specific to the table
  const itemType: string = 'workspace';

  // App settings constant
  const { settings } = useSettings();
  const [preferences] = useState({
    pageSize: 20
  });

  // App layout constants
  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    {
      text: 'Service Workbench',
      href: '#'
    },
    {
      text: 'Login',
      href: '#'
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
  const [dateFilter, setDateFilter] = React.useState<DateRangePickerProps.RelativeValue>({
    type: 'relative',
    amount: 1,
    unit: 'week'
  });
  useEffect(() => {
    setDateFilter(dateFilter);
  }, [dateFilter]);

  // Property and date filter collections
  const { items, filteredItemsCount, collectionProps, filterProps, paginationProps, propertyFilterProps } =
    useCollection(allItems, {
      filtering: {
        empty: TableEmptyDisplay(itemType),
        noMatch: TableNoMatchDisplay(itemType),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteringFunction: (item, filteringText): any => {
          if (dateFilter !== null) {
            const range = convertToAbsoluteRange(dateFilter);
            if (!isWithinInterval(new Date(item.date), range)) {
              return false;
            }
          }

          const filteringTextLowerCase = filteringText.toLowerCase();

          return searchableColumns
            .map((key) => item[key])
            .some(
              (value) => typeof value === 'string' && value.toLowerCase().indexOf(filteringTextLowerCase) > -1
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
  const connectButtonStatuses: string[] = ['AVAILABLE', 'PENDING', 'STOPPED'];
  const stopButtonStatuses: string[] = ['AVAILABLE', 'PENDING', 'STARTED'];
  const terminateButtonStatuses: string[] = ['FAILED', 'PENDING', 'STOPPED'];
  // Constant buttons should show loading based on statuses in the array
  const connectButtonLoadingStatuses: string[] = ['STARTING'];
  const stopButtonLoadingStatuses: string[] = ['STOPPING'];
  const terminateButtonLoadingStatuses: string[] = ['TERMINATING'];
  const isOneItemSelected = (): boolean | undefined => {
    return collectionProps.selectedItems && collectionProps.selectedItems.length === 1;
  };
  const getWorkspaceStatus = (): string => {
    const selectedItems = collectionProps.selectedItems;
    if (selectedItems !== undefined && isOneItemSelected()) {
      const status = collectionProps.selectedItems?.at(0).workspaceStatus;
      return status;
    }
    return '';
  };

  // Split panel constants
  const { header: panelHeader, body: panelBody } = getPanelContent(collectionProps.selectedItems, itemType);
  const { splitPanelOpen, onSplitPanelToggle, splitPanelSize, onSplitPanelResize } = useSplitPanel(
    collectionProps.selectedItems
  );

  return (
    <AppLayout
      id="environments-layout"
      className={styles.baseLayout}
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
      splitPanelOpen={splitPanelOpen}
      onSplitPanelToggle={onSplitPanelToggle}
      splitPanelSize={splitPanelSize}
      onSplitPanelResize={onSplitPanelResize}
      splitPanel={
        <SplitPanel header={panelHeader} i18nStrings={splitPaneli18nstrings}>
          {panelBody}
        </SplitPanel>
      }
      content={
        <Box margin={{ bottom: 'l' }}>
          <Head>
            <title>{settings.name}</title>
            <link rel="icon" href={settings.favicon} />
          </Head>

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
                      ? `(${collectionProps.selectedItems.length}/${allItems.length})`
                      : `(${allItems.length})`
                  }
                  actions={
                    <Box float="right">
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button
                          disabled={!connectButtonStatuses.includes(getWorkspaceStatus())}
                          loading={connectButtonLoadingStatuses.includes(getWorkspaceStatus())}
                        >
                          Connect
                        </Button>
                        <Button
                          disabled={!stopButtonStatuses.includes(getWorkspaceStatus())}
                          loading={stopButtonLoadingStatuses.includes(getWorkspaceStatus())}
                        >
                          Stop
                        </Button>
                        <Button
                          disabled={!terminateButtonStatuses.includes(getWorkspaceStatus())}
                          loading={terminateButtonLoadingStatuses.includes(getWorkspaceStatus())}
                        >
                          Terminate
                        </Button>
                        <Button variant="primary">Create Workspace</Button>
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
      }
    ></AppLayout>
  );
};

export default Environment;
