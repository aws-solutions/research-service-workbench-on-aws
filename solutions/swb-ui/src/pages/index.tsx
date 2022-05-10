import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Box from '@awsui/components-react/box';
import Cards from '@awsui/components-react/cards';
import Grid from '@awsui/components-react/grid';
import PropertyFilter, { PropertyFilterProps } from '@awsui/components-react/property-filter';
import SpaceBetween from '@awsui/components-react/space-between';
import Link from '@awsui/components-react/link';
import ExpandableSection from '@awsui/components-react/expandable-section';
import Head from 'next/head';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import BaseLayout from '../components/BaseLayout';
import Hero from '../components/Hero';
import { useState } from 'react';

export interface HomeProps {
  locale: string;
}

export const getServerSideProps = async ({ locale }: HomeProps): Promise<unknown> => ({
  props: {
    ...(await serverSideTranslations(locale, ['common']))
  }
});

const Home: NextPage = () => {
  const { settings } = useSettings();
  const { displayNotification } = useNotifications();
  const [query, setQuery] = useState<PropertyFilterProps.Query>({
    tokens: [],
    operation: 'and'
  });

  return (
    <BaseLayout navigationHide>
      <Box margin={{ bottom: 'l' }}>
        <Head>
          <title>{settings.name}</title>
          <meta name="description" content={settings.description} />
          <link rel="icon" href={settings.favicon} />
        </Head>

        <Hero />
      </Box>
    </BaseLayout>
  );
};

export default Home;
