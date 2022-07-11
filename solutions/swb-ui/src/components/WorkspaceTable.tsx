import { useCollection } from '@awsui/collection-hooks';
import {
  Box,
  Button,
  CollectionPreferences,
  Header,
  Pagination,
  Table,
  SpaceBetween
} from '@awsui/components-react';
import * as React from 'react';
import { columnDefinitions } from '../environments-table-config/workspacetypesColumnDefinition';
import { allItems } from '../environments-table-config/workspacetypesData';

function WorkspaceTypesTable(): JSX.Element {
  const { collectionProps } = useCollection(allItems, {
    sorting: {},
    selection: {}
  });

  // Action button constants
  // Constant buttons should be enabled based on statuses in the array
  const revokeButtonStatuses: string[] = ['Approved'];
  const approveButtonStatuses: string[] = ['Not Approved'];

  const isOneItemSelected = (): boolean | undefined => {
    return collectionProps.selectedItems && collectionProps.selectedItems.length === 1;
  };

  const getWorkspaceStatus = (): string => {
    const selectedItems = collectionProps.selectedItems;
    if (
      selectedItems !== undefined &&
      isOneItemSelected() &&
      collectionProps.selectedItems?.at(0)?.approval
    ) {
      const status = collectionProps.selectedItems!.at(0)!.approval;
      return status;
    }
    return '';
  };

  return (
    <Box margin={{ bottom: 'l' }}>
      <Table
        {...collectionProps}
        selectionType="multi"
        selectedItems={collectionProps.selectedItems}
        ariaLabels={{
          selectionGroupLabel: 'Items selection',
          allItemsSelectionLabel: ({ selectedItems }) =>
            `${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'} selected`,
          itemSelectionLabel: ({ selectedItems }, item) => {
            const isItemSelected = selectedItems.filter((i) => i.name === item.name).length;
            return `${item.name} is ${isItemSelected ? '' : 'not'} selected`;
          }
        }}
        columnDefinitions={columnDefinitions}
        items={allItems}
        loadingText="Loading resources"
        trackBy="name"
        visibleColumns={['name', 'approval', 'description']}
        header={
          <Header
            counter={
              collectionProps.selectedItems?.length
                ? `(${collectionProps.selectedItems.length}/${allItems.length})`
                : `(${allItems.length})`
            }
            actions={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button disabled={!approveButtonStatuses.includes(getWorkspaceStatus())}>Approve</Button>
                  <Button disabled={!revokeButtonStatuses.includes(getWorkspaceStatus())}>Revoke</Button>
                  <Button>Edit</Button>
                  <Button>Delete</Button>
                </SpaceBetween>
              </Box>
            }
          >
            Workspace Types
          </Header>
        }
        pagination={
          <Pagination
            currentPageIndex={1}
            pagesCount={2}
            ariaLabels={{
              nextPageLabel: 'Next page',
              previousPageLabel: 'Previous page',
              pageLabel: (pageNumber) => `Page ${pageNumber} of all pages`
            }}
          />
        }
        preferences={
          <CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={{
              pageSize: 10,
              visibleContent: ['name', 'approval', 'description']
            }}
            pageSizePreference={{
              title: 'Select page size',
              options: [
                { value: 10, label: '10 resources' },
                { value: 20, label: '20 resources' }
              ]
            }}
            visibleContentPreference={{
              title: 'Select visible content',
              options: [
                {
                  label: 'Main distribution properties',
                  options: [
                    {
                      id: 'name',
                      label: 'Workspace Name',
                      editable: false
                    },
                    { id: 'approval', label: 'Approval' },

                    {
                      id: 'description',
                      label: 'Description'
                    }
                  ]
                }
              ]
            }}
          />
        }
      />
    </Box>
  );
}

export default WorkspaceTypesTable;
