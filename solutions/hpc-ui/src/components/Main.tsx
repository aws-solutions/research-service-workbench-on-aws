import ClustersTable from './ClustersTable';
import { TopNavigation } from '@awsui/components-react';

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
