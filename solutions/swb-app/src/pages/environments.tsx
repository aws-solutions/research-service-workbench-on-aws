import type { NextPage } from 'next';
import BaseLayout from '../components/BaseLayout';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { TableNoMatchDisplay } from '../common/tableNoMatchState';
import Head from 'next/head';
import {
  Box,
  Button,
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

export interface EnvironmentProps {
  locale: string;
}

export const getServerSideProps = async ({ locale }: EnvironmentProps): Promise<unknown> => ({
  props: {
    ...(await serverSideTranslations(locale, ['common']))
  }
});

const Environment: NextPage = () => {
  const { settings } = useSettings();
  const [preferences, setPreferences] = useState({
    pageSize: 20
  });
  const [workspaces, setWorkspaces] = useState<PropertyFilterProps.Query>({
    tokens: [],
    operation: 'and'
  });
  const { items, actions, filteredItemsCount, collectionProps, paginationProps, propertyFilterProps } =
    useCollection(allItems, {
      propertyFiltering: {
        // TODO: replace with file
        filteringProperties: filteringProperties,
        empty: TableEmptyDisplay('workspace'),
        noMatch: TableNoMatchDisplay('workspace')
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: {},
      selection: {}
    });

  useEffect(() => {
    setWorkspaces(workspaces);
  }, []);

  return (
    <BaseLayout>
      <Box margin={{ bottom: 'l' }}>
        <Head>
          <title>{settings.name}</title>
          <link rel="icon" href={settings.favicon} />
        </Head>

        <Table
          {...collectionProps}
          selectionType="single"
          selectedItems={collectionProps.selectedItems}
          ariaLabels={{
            selectionGroupLabel: 'Items selection',
            allItemsSelectionLabel: ({ selectedItems }) =>
              `${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'} selected`,
            itemSelectionLabel: ({ selectedItems }, item: any) => {
              const isItemSelected = selectedItems.filter((i: any) => i.workspace === item.workspace).length;
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
            <PropertyFilter
              {...propertyFilterProps}
              countText={getFilterCounterText(filteredItemsCount)}
              i18nStrings={i18nStrings}
              filteringOptions={filteringOptions}
              expandToViewport={true}
            />
          }
          pagination={<Pagination {...paginationProps} ariaLabels={paginationLables} />}
          empty={TableEmptyDisplay('workspace')}
          items={items}
        />
      </Box>
    </BaseLayout>
  );
};

export default Environment;
