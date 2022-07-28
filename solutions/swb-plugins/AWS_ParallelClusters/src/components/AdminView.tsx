import { Account, Cluster } from '../models/HPC-UI-Types';
import { getAccounts, getClusters } from '../api/hpc-clusters';
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
import ProjectsTable from './ProjectsTable';

export default function AdminView(): JSX.Element {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const accountOptions = accounts.map((account) => {
    return { label: account.id, value: account.id };
  });

  const [clusters, setClusters] = useState<Cluster[]>([]);

  const [selectedAccount, setSelectedAccount] = useState<OptionDefinition>();

  const [isSplitOpen, setSplitOpen] = useState(false);

  const [isClustersLoading, setClustersLoading] = useState(false);

  const [clusterTablePreferences] = useState({ pageSize: 5 });

  useEffect(() => {
    getAccounts()
      .then((items) => {
        setAccounts(items.data);
      })
      .catch(() => {
        setAccounts([]);
        setClustersLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedAccount !== undefined) {
      setClustersLoading(true);
      getClusters(selectedAccount!.value!)
        .then((items) => {
          setClusters(items);
          setClustersLoading(false);
        })
        .catch(() => {
          setClusters([]);
          setClustersLoading(false);
        });
    }
  }, [selectedAccount]);

  const emptyItemType: string = 'cluster';
  const selectItemType: string = 'account';

  const { items, collectionProps, paginationProps } = useCollection(clusters, {
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty:
        selectedAccount === undefined ? TableSelectDisplay(selectItemType) : TableEmptyDisplay(emptyItemType)
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
              <ProjectsTable
                accountId={isSplitOpen ? selectedAccount!.value! : undefined!}
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
              <FormField label="Hosting Accounts">
                <Select
                  expandToViewport
                  selectedOption={selectedAccount!}
                  onChange={({ detail }) => setSelectedAccount(detail.selectedOption!)}
                  options={accountOptions}
                  loadingText="Loading accounts..."
                  placeholder="Choose an account"
                  selectedAriaLabel="Selected"
                  empty="No accounts"
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
