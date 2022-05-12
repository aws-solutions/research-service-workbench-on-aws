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
import { useEffect, useState } from 'react';
import React from 'react';
import { i18nStrings, paginationLables } from '../common/labels';
import { allItems } from '../environments-table-config/workspacesData';
import { columnDefinitions } from '../environments-table-config/workspacesColumnDefinitions';
import { getFilterCounterText } from '../common/tableCounterStrings';
import { filteringOptions } from '../environments-table-config/workspacesFilteringOptions';
import { filteringProperties } from '../environments-table-config/workspacesFilteringProperties';
import { relativeOptions } from '../common/dateRelativeOptions';
import { isValidRangeFunction } from '../common/dateRelativeProperties';
import { TerminateWarning } from '../common/alerts';
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
  // For messages specific to the table
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

  // Button constants
  const [disable, setDisable] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Button alert constants
  const [visible, setVisible] = React.useState(true);

  // Property filter constants
  const [workspaces, setWorkspaces] = useState<PropertyFilterProps.Query>({
    tokens: [],
    operation: 'and'
  });
  const { items, filteredItemsCount, collectionProps, paginationProps, propertyFilterProps } = useCollection(
    allItems,
    {
      propertyFiltering: {
        filteringProperties: filteringProperties,
        empty: TableEmptyDisplay('workspace'),
        noMatch: TableNoMatchDisplay('workspace')
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: {},
      selection: {}
    }
  );
  useEffect(() => {
    setWorkspaces(workspaces);
  }, [workspaces]);

  // Date filter constants
  const [value, setValue] = React.useState<DateRangePickerProps.RelativeValue>({
    type: 'relative',
    amount: 2,
    unit: 'week'
  });
  useEffect(() => {
    setValue(value);
  }, [value]);

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
      // eslint-disable-next-line security/detect-non-literal-fs-filename
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
                          loading={loading}
                          disabled={disable}
                          onClick={() => {
                            setLoading(true);
                            setDisable(false);
                          }}
                        >
                          Connect
                        </Button>
                        <Button disabled={disable} onClick={() => setDisable(true)}>
                          Stop
                        </Button>
                        <Button
                          disabled={disable}
                          onClick={() => {
                            setDisable(false);
                            TerminateWarning('workspace', visible, setVisible);
                          }}
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
                  onChange={({ detail }) => setValue(detail.value)}
                  value={value}
                  relativeOptions={relativeOptions}
                  i18nStrings={{
                    todayAriaLabel: 'Today',
                    nextMonthAriaLabel: 'Next month',
                    previousMonthAriaLabel: 'Previous month',
                    customRelativeRangeDurationLabel: 'Duration',
                    customRelativeRangeDurationPlaceholder: 'Enter duration',
                    customRelativeRangeOptionLabel: 'Custom range',
                    customRelativeRangeOptionDescription: 'Set a custom range in the past',
                    customRelativeRangeUnitLabel: 'Unit of time',
                    formatRelativeRange: (e) => {
                      const t = 1 === e.amount ? e.unit : `${e.unit}s`;
                      return `Last ${e.amount} ${t}`;
                    },
                    formatUnit: (e, t) => (1 === t ? e : `${e}s`),
                    dateTimeConstraintText: 'Range must be between 6 and 30 days. Use 24 hour format.',
                    relativeModeTitle: 'Relative range',
                    absoluteModeTitle: 'Absolute range',
                    relativeRangeSelectionHeading: 'Choose a range',
                    startDateLabel: 'Start date',
                    endDateLabel: 'End date',
                    startTimeLabel: 'Start time',
                    endTimeLabel: 'End time',
                    clearButtonLabel: 'Clear and dismiss',
                    cancelButtonLabel: 'Cancel',
                    applyButtonLabel: 'Apply'
                  }}
                  placeholder="Filter by a date and time range"
                  isValidRange={isValidRangeFunction}
                />
              </>
            }
            pagination={<Pagination {...paginationProps} ariaLabels={paginationLables} />}
            empty={TableEmptyDisplay(itemType)}
            items={items}
          />
        </Box>
      }
    ></AppLayout>
  );
};

export default Environment;
