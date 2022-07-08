import { TopNavigation } from '@awsui/components-react';
import ClustersTable from './ClustersTable';

export default function Main(): JSX.Element {
  return (
    <>
      <TopNavigation
        identity={{
          href: '/',
          title: 'AWS ParallelClusters on SWB'
        }}
        i18nStrings={{
          searchIconAriaLabel: 'Search',
          searchDismissIconAriaLabel: 'Close search',
          overflowMenuTriggerText: 'More',
          overflowMenuTitleText: 'All',
          overflowMenuBackIconAriaLabel: 'Back',
          overflowMenuDismissIconAriaLabel: 'Close menu'
        }}
      />
      <ClustersTable />
    </>
  );
}
