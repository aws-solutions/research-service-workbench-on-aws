import { Cluster, Project } from '../models/HPC-UI-Types';
import { getProjects, getClusters } from '../api/hpc-clusters';
import { useCollection } from '@awsui/collection-hooks';
import { useState, useEffect } from 'react';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { columnDefinitions } from '../hpc-table-config/clustersColumnDefinitions';
import { filteringProperties } from '../hpc-table-config/clustersFilteringProperties';
import { OptionDefinition } from '@awsui/components-react/internal/components/option/interfaces';
import { AppLayout, Box, Header, Select, SplitPanel, SpaceBetween, Table } from '@awsui/components-react';
import JobsTable from './JobsTable';

export default function ClustersTable(): JSX.Element {
  const [projects, setProjects] = useState([] as Project[]);

  const options = projects.map((project) => {
    return { label: project.id, value: project.id };
  });

  const [clusters, setClusters] = useState([] as Cluster[]);

  const [selectedOption, setSelectedOption] = useState([] as OptionDefinition);

  const [isSplitOpen, setSplitOpen] = useState(true);

  useEffect(() => {
    getProjects()
      .then((items) => setProjects(items.data))
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    getClusters(selectedOption.value!)
      .then((items) => setClusters(items))
      .catch(() => setClusters([]));
  }, [selectedOption.value]);

  const itemType: string = 'cluster';

  const { items, collectionProps } = useCollection(clusters, {
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty: TableEmptyDisplay(itemType)
    },
    sorting: {},
    selection: {}
  });

  return (
    <AppLayout
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
          header="Job Management Panel"
        >
          <JobsTable
            projectId={selectedOption.value!}
            clusterName={collectionProps.selectedItems?.at(0)?.clusterName!}
          />
        </SplitPanel>
      }
      content={
        <Table
          {...collectionProps}
          selectionType="single"
          selectedItems={collectionProps.selectedItems}
          columnDefinitions={columnDefinitions}
          loadingText="Loading clusters"
          items={items}
          header={
            <Header
              counter={`(${clusters.length})`}
              actions={
                <Box float="right">
                  <SpaceBetween direction="horizontal" size="xs">
                    <Header variant="h3">Select Project:</Header>
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
