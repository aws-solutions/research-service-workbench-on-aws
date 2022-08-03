import App from 'my-app';
// eslint-disable-next-line import/order
import { BreadcrumbGroupProps } from '@awsui/components-react';
import BaseLayout from '../../components/BaseLayout';

const breadcrumbs: BreadcrumbGroupProps.Item[] = [
  {
    text: 'Service Workbench',
    href: '/'
  },
  {
    text: 'My_Create_React_App_Using_TS',
    href: '/apps/My_Create_React_App_Using_TS'
  }
];

function MY_CREATE_REACT_APP_USING_TS_APP(): JSX.Element {
  breadcrumbs[1].text = breadcrumbs[1].text.replace(/_/g, ' ');
  return (
    <BaseLayout breadcrumbs={breadcrumbs}>
      <App />
    </BaseLayout>
  );
}
export default MY_CREATE_REACT_APP_USING_TS_APP;
