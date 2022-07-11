import { useCollection } from '@awsui/collection-hooks';
import {
  Box,
  Button,
  CollectionPreferences,
  Header,
  Pagination,
  Table,
  TextFilter
} from '@awsui/components-react';
import * as React from 'react';
import { columnDefinitions } from '../environments-table-config/awsServiceCatalogColumnDefinition';
import { allItems } from '../environments-table-config/awsServiceCatalogData';

function AwsServiceCatalogProductsTable(): JSX.Element {
  const { collectionProps } = useCollection(allItems, {
    sorting: {},
    selection: {}
  });
  return (
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
      visibleColumns={['name', 'description']}
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            No resources to display.
          </Box>
          <Button>Create resource</Button>
        </Box>
      }
      filter={<TextFilter filteringPlaceholder="Find resources" filteringText="" />}
      header={
        <Header
          counter={
            collectionProps.selectedItems?.length
              ? `(${collectionProps.selectedItems.length}/${allItems.length})`
              : `(${allItems.length})`
          }
          actions={
            <Box float="right">
              <Button variant="primary">Import</Button>
            </Box>
          }
        >
          AWS Service Catalog Products
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
            visibleContent: ['variable', 'value', 'type', 'description']
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
                    id: 'Product Name',
                    label: 'Product Name',
                    editable: false
                  },

                  { id: 'description', label: 'Description' }
                ]
              }
            ]
          }}
        />
      }
    />
  );
}

export default AwsServiceCatalogProductsTable;
