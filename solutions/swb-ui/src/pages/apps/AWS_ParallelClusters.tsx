import App from '@aws/hpc-ui';
// eslint-disable-next-line import/order
import { BreadcrumbGroupProps } from '@awsui/components-react';
import BaseLayout from '../../components/BaseLayout';

const breadcrumbs: BreadcrumbGroupProps.Item[] = [
  {
    text: 'Service Workbench',
    href: '/'
  },
  {
    text: 'AWS_ParallelClusters',
    href: '/apps/AWS_ParallelClusters'
  }
];

function AWS_PARALLELCLUSTERS_APP(): JSX.Element {
  breadcrumbs[1].text = breadcrumbs[1].text.replace(/_/g, ' ');
  return (
    <BaseLayout breadcrumbs={breadcrumbs}>
      <App />
    </BaseLayout>
  );
}
export default AWS_PARALLELCLUSTERS_APP;
