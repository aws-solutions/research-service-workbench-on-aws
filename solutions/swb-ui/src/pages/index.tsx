import Box from '@awsui/components-react/box';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import BaseLayout from '../components/BaseLayout';
import Hero from '../components/Hero';
import { useSettings } from '../context/SettingsContext';

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
