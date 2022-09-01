/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useDatasets, columnDefinitions, searchableColumns, filteringOptions, filteringProperties } from '@aws/workbench-core-datasets-ui';
import { i18nStrings, getFilterCounterText, TableEmptyDisplay, TableNoMatchDisplay, useNotifications, BaseLayout } from '@aws/workbench-core-swb-common-ui';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  Box,
  BreadcrumbGroupProps,
  Header,
  PropertyFilter,
  SpaceBetween,
  Table
} from '@cloudscape-design/components';
import { FlashbarProps } from '@cloudscape-design/components/flashbar';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

const Dataset: NextPage = () => {
  // For functions to return content specific to the table
  const itemType: string = 'dataset';
  // App settings constant

  const { datasets, areDatasetsLoading } = useDatasets();
  const router = useRouter();
  const { message, notificationType } = router.query;
  const { displayNotification, closeNotification } = useNotifications();

  const [hasInitialNotificationBeenShown, setHasInitialNotificationBeenShown] = useState(false);
  if (!!message && !!notificationType && !hasInitialNotificationBeenShown) {
    const datasetMessageId = 'DatasetMessage';
    const notification = {
      type: notificationType as FlashbarProps.Type,
      dismissible: true,
      dismissLabel: 'Dismiss message',
      onDismiss: () => {
        closeNotification(datasetMessageId);
      },
      content: message,
      id: datasetMessageId
    };
    displayNotification(datasetMessageId, notification);
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

  const getContent = (): JSX.Element => {
    return (
      <Box>
        <Table
          {...collectionProps}
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
            </SpaceBetween>
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
