/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useProjects } from '@aws/workbench-core-accounts-ui';
import { BaseLayout } from '@aws/workbench-core-swb-common-ui';
import { BreadcrumbGroupProps } from '@cloudscape-design/components';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { createDataset } from '../api/datasets';
import { NewDatasetForm } from '../components/CreateInternalDatasetForm';
import { CreateDatasetForm } from '../models/Dataset';

export const NewDatasetPage: NextPage = () => {
  const router = useRouter();
  const { projects, areProjectsLoading } = useProjects();

  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    {
      text: 'Service Workbench',
      href: '/'
    },
    {
      text: 'Organizational Datasets',
      href: '/datasets'
    },
    {
      text: 'Create new dataset',
      href: '/datasets/new'
    }
  ];

  const onFormSubmit = async (formData: CreateDatasetForm): Promise<void> => {
    await createDataset(formData);
    await router.push({
      pathname: '/datasets',
      query: {
        message: `Internal dataset [${formData.datasetName}] has been created successfully. You can now upload files to the dataset.`,
        notificationType: 'success'
      }
    });
  };

  return (
    <BaseLayout breadcrumbs={breadcrumbs} activeHref="/datasets">
      <NewDatasetForm
        onFormSubmit={onFormSubmit}
        projects={projects}
        areProjectsLoading={areProjectsLoading}
      />
    </BaseLayout>
  );
};
