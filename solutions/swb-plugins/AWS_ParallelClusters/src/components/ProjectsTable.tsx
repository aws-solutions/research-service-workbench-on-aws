import { useState, useEffect } from 'react';
import { getProjects } from '../api/hpc-clusters';
import { useCollection } from '@awsui/collection-hooks';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { TableSelectDisplay } from '../common/tableSelectState';
import { columnDefinitions } from '../hpc-table-config/projectsColumnDefinitions';
import { filteringProperties } from '../hpc-table-config/jobsFilteringProperties';
import { Box, Button, Header, Pagination, SpaceBetween, Table } from '@awsui/components-react';

interface ProjectsTableProps {
  accountId: string;
  clusterName: string;
}

interface SimpleProject {
  id: string;
}

export default function ProjectsTable(props: ProjectsTableProps): JSX.Element {
  const [projects, setProjects] = useState<SimpleProject[]>([]);

  const [isProjectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    setProjectsLoading(true);
    getProjects()
      .then((items) => {
        setProjects(
          items.data.map((project) => {
            return { id: project.id };
          })
        );
      })
      .catch(() => {
        setProjects([]);
      });
    setProjectsLoading(false);
  }, [props]);

  const [projectsTablePreferences] = useState({ pageSize: 4 });

  const emptyItemType: string = 'project';
  const selectItemType: string = 'cluster';

  const { items, collectionProps, paginationProps } = useCollection(projects, {
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty:
        props.clusterName === undefined
          ? TableSelectDisplay(selectItemType)
          : TableEmptyDisplay(emptyItemType)
    },
    selection: {
      trackBy: 'id'
    },
    pagination: { pageSize: projectsTablePreferences.pageSize },
    sorting: {}
  });

  const executeProjectAssign = async (): Promise<void> => {
    collectionProps.selectedItems?.forEach(async (job) => {
      await job;
    });
  };

  return (
    <Table
      {...collectionProps}
      selectionType="multi"
      selectedItems={collectionProps.selectedItems}
      columnDefinitions={columnDefinitions}
      loading={isProjectsLoading}
      loadingText="Loading projects..."
      items={items}
      pagination={<Pagination {...paginationProps} />}
      header={
        <SpaceBetween direction="vertical" size="xs">
          <Header
            counter={
              collectionProps.selectedItems?.length !== 0
                ? `(${collectionProps.selectedItems?.length}/${projects.length})`
                : `(${projects.length})`
            }
            actions={
              <Box float="right">
                <Button
                  variant="primary"
                  disabled={collectionProps.selectedItems?.length === 0}
                  onClick={() => executeProjectAssign()}
                >
                  Assign
                </Button>
              </Box>
            }
            variant="h2"
          >
            Project Management
          </Header>
        </SpaceBetween>
      }
    />
  );
}
