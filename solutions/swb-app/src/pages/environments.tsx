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
import React from 'react';

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
  // TODO? Breadcrump group?
  // TODO: implement state-based workspace selection
  const [selectedItems, setSelectedItems] = React.useState();
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
          // onSelectionChange={({ detail }) =>
          //   setSelectedItems(detail.selectedItems)
          // }
          selectedItems={selectedItems}
          // ariaLabels={{
          //   selectionGroupLabel: "Items selection",
          //   allItemsSelectionLabel: ({ selectedItems }) =>
          //   `${selectedItems.length} ${selectedItems.length === 1 ? "item" : "items"} selected`,
          //   itemSelectionLabel: ({ selectedItems }, item) => {
          //     const isItemSelected = selectedItems.filter(
          //       i => i.workspace === item.workspace
          //     ).length;
          //     return `${item.workspace} is ${isItemSelected ? "" : "not"} selected`;
          //   }
          // }}
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
          // TODO: populate with real data
          items={[
            {
              workspace: 'workspace1',
              workspacestatus: 'Pending',
              lastaccessed: '5/3/2022',
              project: 'TestProject',
              owner: 'Test User',
              connections: 0,
              workspaceactions: (
                <>
                  <Button href="/#" disabled>
                    Connect
                  </Button>{' '}
                  <Button href="/#" disabled>
                    Stop
                  </Button>{' '}
                  <Button href="/#" disabled>
                    Terminate
                  </Button>
                </>
              )
            },
            {
              workspace: 'workspace2',
              workspacestatus: 'Errored',
              lastaccessed: '5/3/2022',
              project: 'SampleProject',
              owner: 'Test User',
              connections: 0,
              workspaceactions: (
                <>
                  <Button href="/#" disabled>
                    Connect
                  </Button>{' '}
                  <Button href="/#" disabled>
                    Stop
                  </Button>{' '}
                  <Button href="/#">Terminate</Button>
                </>
              )
            },
            {
              workspace: 'workspace3',
              workspacestatus: 'Available',
              lastaccessed: '5/2/2022',
              project: 'MyProject',
              owner: 'Sample User',
              connections: 3,
              workspaceactions: (
                <>
                  <Button href="/#" disabled>
                    Connect
                  </Button>{' '}
                  <Button href="/#">Stop</Button> <Button href="/#">Terminate</Button>
                </>
              )
            },
            {
              workspace: 'workspace4',
              workspacestatus: 'Available',
              lastaccessed: '5/2/2022',
              project: 'SampleProject',
              owner: 'Sample User',
              connections: 8,
              workspaceactions: (
                <>
                  <Button href="/#" disabled>
                    Connect
                  </Button>{' '}
                  <Button href="/#">Stop</Button> <Button href="/#">Terminate</Button>
                </>
              )
            },
            {
              workspace: 'workspace5',
              workspacestatus: 'Stopped',
              lastaccessed: '4/29/2022',
              project: 'MVPProject',
              owner: 'Sample User',
              connections: 41,
              workspaceactions: (
                <>
                  <Button href="/environments">Connect</Button>{' '}
                  <Button href="/login" disabled>
                    Stop
                  </Button>{' '}
                  <Button href="/environments2">Terminate</Button>
                </>
              )
            },
            {
              workspace: 'workspace6',
              workspacestatus: 'Stopped',
              lastaccessed: '4/29/2022',
              project: 'TestProject',
              owner: 'Test User',
              connections: 7,
              workspaceactions: (
                <>
                  <Button href="/environments">Connect</Button>{' '}
                  <Button href="/login" disabled>
                    Stop
                  </Button>{' '}
                  <Button href="/environments2">Terminate</Button>
                </>
              )
            },
            {
              workspace: 'workspace7',
              workspacestatus: 'Stopped',
              lastaccessed: '4/20/2022',
              project: 'CAProject',
              owner: 'Intern User',
              connections: 33,
              workspaceactions: (
                <>
                  <Button href="/environments">Connect</Button>{' '}
                  <Button href="/login" disabled>
                    Stop
                  </Button>{' '}
                  <Button href="/environments2">Terminate</Button>
                </>
              )
            },
            {
              workspace: 'workspace8',
              workspacestatus: 'Stopped',
              lastaccessed: '4/18/2022',
              project: 'BRProject',
              owner: 'Senior User',
              connections: 1,
              workspaceactions: (
                <>
                  <Button href="/environments">Connect</Button>{' '}
                  <Button href="/login" disabled>
                    Stop
                  </Button>{' '}
                  <Button href="/environments2">Terminate</Button>
                </>
              )
            },
            {
              workspace: 'workspace9',
              workspacestatus: 'Terminated',
              lastaccessed: '4/17/2022',
              project: 'NYCProject',
              owner: 'Admin User',
              connections: 0,
              workspaceactions: (
                <>
                  <Button href="/environments" disabled>
                    Connect
                  </Button>{' '}
                  <Button href="/login" disabled>
                    Stop
                  </Button>{' '}
                  <Button href="/environments2" disabled>
                    Terminate
                  </Button>
                </>
              )
            }
          ]}
          loadingText="Loading workspaces"
          // TODO: logic for Expandable section on each row
          selectionType="single"
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
              countText="" // TODO: show num of matches
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
            <>
              {/* TODO: show num of workspaces */}
              <Header counter={'()'}>Workspaces</Header>
              <Box float="right">
                <Button variant="primary">Create Workspace</Button>
              </Box>
            </>
          }
        />
      </Box>
    </BaseLayout>
  );
};

export default Environment;
