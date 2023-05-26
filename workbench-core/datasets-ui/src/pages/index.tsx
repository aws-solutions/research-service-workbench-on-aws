/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useNotifications, BaseLayout } from '@aws/workbench-core-swb-common-ui';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { Box, BreadcrumbGroupProps, Header, SpaceBetween, Table } from '@cloudscape-design/components';
import { FlashbarProps } from '@cloudscape-design/components/flashbar';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useDatasets } from '../api/datasets';
import { columnDefinitions } from '../datasets-table-config/datasetsColumnDefinitions';

export const DatasetsPage: NextPage = () => {
  // For functions to return content specific to the table
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
      text: 'Research Service Workbench',
      href: '/'
    },
    {
      text: 'Datasets',
      href: '/datasets'
    }
  ];

  // Property and date filter collections
  const { items } = useCollection(datasets, {});

  const getContent = (): JSX.Element => {
    return (
      <Box>
        <Table
          loading={areDatasetsLoading}
          selectionType="multi"
          header={
            <>
              <Header
                actions={
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs"></SpaceBetween>
                  </Box>
                }
              >
                Datasets
              </Header>
            </>
          }
          columnDefinitions={columnDefinitions}
          loadingText="Loading datasets"
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
