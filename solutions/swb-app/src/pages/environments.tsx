import type { NextPage } from 'next';
import BaseLayout from '../components/BaseLayout';
import Head from 'next/head';
import {
  Box,
  Button,
  Grid,
  Header,
  // CollectionPreferences,
  // Icon,
  // Pagination,
  PropertyFilter,
  PropertyFilterProps,
  Table
} from '@awsui/components-react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSettings } from '../context/SettingsContext';
import { useState } from 'react';

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
  const [query, setQuery] = useState<PropertyFilterProps.Query>({
    tokens: [],
    operation: 'and'
  });

  return (
    <BaseLayout>
      <Box margin={{ bottom: 'l' }}>
        <Head>
          <title>{settings.name}</title>
          <link rel="icon" href={settings.favicon} />
        </Head>

        <Table
          columnDefinitions={[
            {
              id: 'workspace',
              header: 'Workspace',
              cell: (e) => e.workspace,
              sortingField: 'workspace'
            },
            {
              id: 'workspacestatus',
              header: 'Workspace status',
              cell: (e) => e.workspacestatus,
              sortingField: 'workspacestatus'
            },
            {
              id: 'lastaccessed',
              header: 'Last accessed',
              cell: (e) => e.lastaccessed,
              sortingField: 'lastaccessed'
            },
            {
              id: 'project',
              header: 'Project',
              cell: (e) => e.project,
              sortingField: 'project'
            },
            {
              id: 'owner',
              header: 'Owner',
              cell: (e) => e.owner,
              sortingField: 'owner'
            },
            {
              id: 'connections',
              header: 'Connections',
              cell: (e) => e.connections,
              sortingField: 'connections'
            },
            {
              id: 'workspaceactions',
              header: 'Workspace actions',
              cell: (e) => e.workspaceactions
            }
          ]}
          items={
            [
              // {
              //   workspace: '',
              //   workspacestatus: 'Pending',
              //   lastaccessed: '',
              //   project: '',
              //   owner: '',
              //   connections: '',
              //   workspaceactions: ''
              // }
            ]
          }
          loadingText="Loading workspaces"
          empty={
            <Box textAlign="center" color="inherit">
              <b>No workspaces</b>
              <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                No workspaces to display.
              </Box>
              <Button>Create Workspace</Button>
            </Box>
          }
          filter={
            <PropertyFilter
              onChange={({ detail }) => setQuery(detail)}
              query={query}
              i18nStrings={{
                filteringAriaLabel: 'your choice',
                dismissAriaLabel: 'Dismiss',
                filteringPlaceholder: 'Search',
                groupValuesText: 'Values',
                groupPropertiesText: 'Properties',
                operatorsText: 'Operators',
                operationAndText: 'and',
                operationOrText: 'or',
                operatorLessText: 'Less than',
                operatorLessOrEqualText: 'Less than or equal',
                operatorGreaterText: 'Greater than',
                operatorGreaterOrEqualText: 'Greater than or equal',
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
                enteredTextLabel: (text) => `Use: "${text}"`
              }}
              countText="25 matches"
              // TODO: add logic to get project values, workspacetype values, and owner values for filtering
              filteringOptions={[
                { propertyKey: 'owner', value: '' },
                { propertyKey: 'project', value: '' },
                { propertyKey: 'workspacestatus', value: 'Available' },
                { propertyKey: 'workspacestatus', value: 'Errored' },
                { propertyKey: 'workspacestatus', value: 'Pending' },
                { propertyKey: 'workspacestatus', value: 'Stopped' },
                { propertyKey: 'workspacestatus', value: 'Terminated' },
                { propertyKey: 'workspacetype', value: '' }
              ]}
              filteringProperties={[
                {
                  key: 'workspacestatus',
                  operators: ['=', '!='],
                  propertyLabel: 'Workspace Status',
                  groupValuesLabel: 'Workspace Status Values'
                },
                {
                  key: 'project',
                  operators: ['=', '!=', ':', '!:'],
                  propertyLabel: 'Project',
                  groupValuesLabel: 'Project Values'
                }
              ]}
            />
          }
          header={
            <Header counter={'(0)'}>
              Workspaces
              <view>
                <Box float="right">
                  <Button variant="primary">Create Workspace</Button>
                </Box>
              </view>
              {/* <Grid gridDefinition={[{colspan: 6}, {colspan: 6}]}>
                <div></div>
                <div>
                  <Box float='right'>
                    <Button variant='primary'>Create Workspace</Button>
                  </Box>
                </div>               
              </Grid> */}
            </Header>
          }
        />
      </Box>
    </BaseLayout>
  );
};

export default Environment;
