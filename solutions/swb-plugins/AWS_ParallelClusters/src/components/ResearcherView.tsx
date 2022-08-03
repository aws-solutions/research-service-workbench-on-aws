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
  FormField,
  Header,
  Link,
  Pagination,
  Select,
  SpaceBetween,
  SplitPanel,
  Table
} from '@awsui/components-react';
import JobsTable from './JobsTable';

export default function ResearcherView(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);

  const projectOptions = projects.map((project) => {
    return { label: project.id, value: project.id };
  });

  const [clusters, setClusters] = useState<Cluster[]>([]);

  const [selectedProject, setSelectedProject] = useState<OptionDefinition>();

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
    if (selectedProject !== undefined) {
      setClustersLoading(true);
      getClusters(selectedProject!.value!)
        .then((items) => {
          setClusters(items);
          setClustersLoading(false);
        })
        .catch(() => {
          setClusters([]);
          setClustersLoading(false);
        });
    }
  }, [selectedProject]);

  const emptyItemType: string = 'cluster';
  const selectItemType: string = 'project';

  const { items, collectionProps, paginationProps } = useCollection(clusters, {
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty:
        selectedProject === undefined ? TableSelectDisplay(selectItemType) : TableEmptyDisplay(emptyItemType)
    },
    selection: {
      trackBy: 'clusterName'
    },
    pagination: { pageSize: clusterTablePreferences.pageSize },
    sorting: {}
  });

  useEffect(() => {
    if (collectionProps.selectedItems?.length !== 0) {
      setSplitOpen(true);
    } else {
      setSplitOpen(false);
    }
  }, [collectionProps.selectedItems]);

  return (
    <AppLayout
      disableContentPaddings
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
            collectionProps.selectedItems?.length !== 0
              ? collectionProps.selectedItems?.at(0)?.clusterName!
              : '0 clusters selected'
          }
        >
          {collectionProps.selectedItems?.length !== 0 ? (
            <Box padding={{ left: 'l', right: 'l' }}>
              <JobsTable
                projectId={isSplitOpen ? selectedProject!.value! : undefined!}
                clusterName={isSplitOpen ? collectionProps.selectedItems?.at(0)?.clusterName! : undefined!}
              />
            </Box>
          ) : (
            <Box padding={{ left: 'l', right: 'l' }}>Select a cluster to see its details.</Box>
          )}
        </SplitPanel>
      }
      content={
        <SpaceBetween direction="vertical" size="m">
          <Header
            description="View and manage your batch jobs within Service Workbench."
            variant="h1"
            info={
              <Link href="https://aws.amazon.com/hpc/parallelcluster/" variant="info">
                Info
              </Link>
            }
          >
            AWS ParallelClusters
          </Header>
          <Table
            {...collectionProps}
            selectionType="single"
            selectedItems={collectionProps.selectedItems}
            columnDefinitions={columnDefinitions}
            loading={isClustersLoading}
            loadingText="Loading clusters..."
            items={items}
            filter={
              <FormField label="Project">
                <Select
                  expandToViewport
                  selectedOption={selectedProject!}
                  onChange={({ detail }) => setSelectedProject(detail.selectedOption!)}
                  options={projectOptions}
                  loadingText="Loading projects..."
                  placeholder="Choose a project"
                  selectedAriaLabel="Selected"
                  empty="No projects"
                />
              </FormField>
            }
            pagination={<Pagination {...paginationProps} />}
            header={
              <Header counter={`(${clusters.length})`} variant="h2">
                Clusters
              </Header>
            }
          />
        </SpaceBetween>
      }
    />
  );
}
