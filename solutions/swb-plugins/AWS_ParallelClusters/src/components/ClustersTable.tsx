import { Cluster, Project } from '../models/HPC-UI-Types';
import { getProjects, getClusters } from '../api/hpc-clusters';
import { useCollection } from '@awsui/collection-hooks';
import { useState, useEffect } from 'react';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { TableSelectDisplay } from '../common/tableSelectState';
import { columnDefinitions } from '../hpc-table-config/clustersColumnDefinitions';
import { filteringProperties } from '../hpc-table-config/clustersFilteringProperties';
import { OptionDefinition } from '@awsui/components-react/internal/components/option/interfaces';
import {
  AppLayout,
  Box,
  BreadcrumbGroup,
  Header,
  Link,
  Pagination,
  Select,
  SplitPanel,
  SpaceBetween,
  Table
} from '@awsui/components-react';
import JobsTable from './JobsTable';

export default function ClustersTable(): JSX.Element {
  const [projects, setProjects] = useState([] as Project[]);

  const options = projects.map((project) => {
    return { label: project.id, value: project.id };
  });

  const [clusters, setClusters] = useState([] as Cluster[]);

  const [selectedOption, setSelectedOption] = useState([] as OptionDefinition);

  const [isSplitOpen, setSplitOpen] = useState(false);

  const [isClustersLoading, setClustersLoading] = useState(false);

  const [clusterTablePreferences] = useState({ pageSize: 5 });

  useEffect(() => {
    getProjects()
      .then((items) => {
        setProjects(items.data);
      })
      .catch(() => {
        setProjects([]);
        setClustersLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedOption.value! !== undefined) {
      setClustersLoading(true);
      getClusters(selectedOption.value!)
        .then((items) => {
          setClusters(items);
          setClustersLoading(false);
        })
        .catch(() => {
          setClusters([]);
          setClustersLoading(false);
        });
    }
  }, [selectedOption.value]);

  const emptyItemType: string = 'cluster';
  const selectItemType: string = 'project';

  const { items, collectionProps, paginationProps } = useCollection(clusters, {
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty:
        selectedOption.value! === undefined
          ? TableSelectDisplay(selectItemType)
          : TableEmptyDisplay(emptyItemType)
    },
    selection: {
      trackBy: 'clusterName'
    },
    pagination: { pageSize: clusterTablePreferences.pageSize },
    sorting: {}
  });

  useEffect(() => {
    if (collectionProps.selectedItems?.at(0)?.clusterName! !== undefined) {
      setSplitOpen(true);
    } else {
      setSplitOpen(false);
    }
  }, [collectionProps.selectedItems]);

  return (
    <AppLayout
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: 'Service Workbench', href: '/' },
            {
              text: 'AWS ParallelClusters',
              href: '#components/breadcrumb-group'
            }
          ]}
        />
      }
      contentHeader={
        <Header
          description="View and manage AWS ParallelClusters for batch jobs all within Service Workbench."
          variant="h1"
          info={
            <Link href="https://aws.amazon.com/hpc/parallelcluster/" variant="info">
              Info
            </Link>
          }
        >
          AWS ParallelClusters
        </Header>
      }
      disableContentHeaderOverlap
      navigationHide
      toolsHide
      splitPanelOpen={isSplitOpen}
      onSplitPanelToggle={(e) => {
        setSplitOpen(e.detail.open);
      }}
      splitPanel={
        <SplitPanel
          hidePreferencesButton
          i18nStrings={{
            preferencesTitle: 'Split panel preferences',
            preferencesPositionLabel: 'Split panel position',
            preferencesPositionDescription: 'Choose the default split panel position for the service.',
            preferencesPositionSide: 'Side',
            preferencesPositionBottom: 'Bottom',
            preferencesConfirm: 'Confirm',
            preferencesCancel: 'Cancel',
            closeButtonAriaLabel: 'Close panel',
            openButtonAriaLabel: 'Open panel',
            resizeHandleAriaLabel: 'Resize split panel'
          }}
          header={
            collectionProps.selectedItems?.at(0)?.clusterName! !== undefined
              ? collectionProps.selectedItems?.at(0)?.clusterName!
              : '0 clusters selected'
          }
        >
          {collectionProps.selectedItems?.at(0)?.clusterName! !== undefined ? (
            <JobsTable
              projectId={isSplitOpen ? selectedOption.value! : undefined!}
              clusterName={isSplitOpen ? collectionProps.selectedItems?.at(0)?.clusterName! : undefined!}
            />
          ) : (
            <Box>Select a cluster to see its details.</Box>
          )}
        </SplitPanel>
      }
      content={
        <Table
          {...collectionProps}
          selectionType="single"
          selectedItems={collectionProps.selectedItems}
          columnDefinitions={columnDefinitions}
          loading={isClustersLoading}
          loadingText="Loading clusters..."
          items={items}
          pagination={<Pagination {...paginationProps} />}
          header={
            <Header
              counter={`(${clusters.length})`}
              actions={
                <Box float="right">
                  <SpaceBetween direction="horizontal" size="xs">
                    <Box variant="h3" color="text-label">
                      Select Project:
                    </Box>
                    <Select
                      expandToViewport
                      selectedOption={selectedOption}
                      onChange={({ detail }) => setSelectedOption(detail.selectedOption!)}
                      options={options}
                      loadingText="Loading projects..."
                      placeholder="Choose a project"
                      selectedAriaLabel="Selected"
                      empty="No projects"
                    />
                  </SpaceBetween>
                </Box>
              }
              variant="h2"
            >
              Clusters
            </Header>
          }
        />
      }
    />
  );
}
