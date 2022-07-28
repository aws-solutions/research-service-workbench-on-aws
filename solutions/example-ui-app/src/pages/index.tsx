/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Box from '@awsui/components-react/box';
import Cards from '@awsui/components-react/cards';
import ExpandableSection from '@awsui/components-react/expandable-section';
import Grid from '@awsui/components-react/grid';
import Link from '@awsui/components-react/link';
import PropertyFilter, { PropertyFilterProps } from '@awsui/components-react/property-filter';
import SpaceBetween from '@awsui/components-react/space-between';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useState } from 'react';
import Hero from '../components/Hero';
import { useNotifications } from '../context/NotificationContext';
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
  const { displayNotification } = useNotifications();
  const [query, setQuery] = useState<PropertyFilterProps.Query>({
    tokens: [],
    operation: 'and'
  });

  displayNotification('temp', {
    type: 'info',
    header: 'This is a sample notification',
    content: (
      <span>
        We can use HTML here for the notifaction body
        <Link href="#/" color="inverted">
          link
        </Link>
        , or{' '}
        <Link external href="#/" color="inverted">
          another link
        </Link>
        .
      </span>
    )
  });

  return (
    <Box margin={{ bottom: 'l' }}>
      <Head>
        <title>{settings.name}</title>
        <meta name="description" content={settings.description} />
        <link rel="icon" href={settings.favicon} />
      </Head>

      <Hero />

      <Box padding={{ top: 'xxxl', horizontal: 's' }}>
        <Grid gridDefinition={[{ colspan: { xl: 10 }, offset: { l: 2, xxs: 1 } }]}>
          <div>
            <SpaceBetween size="xxl">
              <Box variant="h1" tagOverride="h2">
                All dashboards
              </Box>
              <PropertyFilter
                onChange={({ detail }) => setQuery(detail)}
                query={query}
                i18nStrings={{
                  filteringAriaLabel: 'your choice',
                  dismissAriaLabel: 'Dismiss',
                  filteringPlaceholder: 'Search',
                  groupValuesText: 'Values',
                  groupPropertiesText: 'Properties',
                  operatorsText: 'Operators',
                  operationAndText: 'and',
                  operationOrText: 'or',
                  operatorLessText: 'Less than',
                  operatorLessOrEqualText: 'Less than or equal',
                  operatorGreaterText: 'Greater than',
                  operatorGreaterOrEqualText: 'Greater than or equal',
                  operatorContainsText: 'Contains',
                  operatorDoesNotContainText: 'Does not contain',
                  operatorEqualsText: 'Equals',
                  operatorDoesNotEqualText: 'Does not equal',
                  editTokenHeader: 'Edit filter',
                  propertyText: 'Property',
                  operatorText: 'Operator',
                  valueText: 'Value',
                  cancelActionText: 'Cancel',
                  applyActionText: 'Apply',
                  allPropertiesLabel: 'All properties',
                  tokenLimitShowMore: 'Show more',
                  tokenLimitShowFewer: 'Show fewer',
                  clearFiltersText: 'Clear filters',
                  removeTokenButtonAriaLabel: () => 'Remove token',
                  enteredTextLabel: (text) => `Use: "${text}"`
                }}
                countText="5 matches"
                filteringOptions={[
                  {
                    propertyKey: 'instanceid',
                    value: 'i-2dc5ce28a0328391'
                  },
                  {
                    propertyKey: 'instanceid',
                    value: 'i-d0312e022392efa0'
                  },
                  {
                    propertyKey: 'instanceid',
                    value: 'i-070eef935c1301e6'
                  },
                  {
                    propertyKey: 'instanceid',
                    value: 'i-3b44795b1fea36ac'
                  },
                  { propertyKey: 'state', value: 'Stopped' },
                  { propertyKey: 'state', value: 'Stopping' },
                  { propertyKey: 'state', value: 'Pending' },
                  { propertyKey: 'state', value: 'Running' },
                  {
                    propertyKey: 'instancetype',
                    value: 't3.small'
                  },
                  {
                    propertyKey: 'instancetype',
                    value: 't2.small'
                  },
                  { propertyKey: 'instancetype', value: 't3.nano' },
                  {
                    propertyKey: 'instancetype',
                    value: 't2.medium'
                  },
                  {
                    propertyKey: 'instancetype',
                    value: 't3.medium'
                  },
                  {
                    propertyKey: 'instancetype',
                    value: 't2.large'
                  },
                  { propertyKey: 'instancetype', value: 't2.nano' },
                  {
                    propertyKey: 'instancetype',
                    value: 't2.micro'
                  },
                  {
                    propertyKey: 'instancetype',
                    value: 't3.large'
                  },
                  {
                    propertyKey: 'instancetype',
                    value: 't3.micro'
                  },
                  { propertyKey: 'averagelatency', value: '17' },
                  { propertyKey: 'averagelatency', value: '53' },
                  { propertyKey: 'averagelatency', value: '73' },
                  { propertyKey: 'averagelatency', value: '74' },
                  { propertyKey: 'averagelatency', value: '107' },
                  { propertyKey: 'averagelatency', value: '236' },
                  { propertyKey: 'averagelatency', value: '242' },
                  { propertyKey: 'averagelatency', value: '375' },
                  { propertyKey: 'averagelatency', value: '402' },
                  { propertyKey: 'averagelatency', value: '636' },
                  { propertyKey: 'averagelatency', value: '639' },
                  { propertyKey: 'averagelatency', value: '743' },
                  { propertyKey: 'averagelatency', value: '835' },
                  { propertyKey: 'averagelatency', value: '981' },
                  { propertyKey: 'averagelatency', value: '995' }
                ]}
                filteringProperties={[
                  {
                    key: 'instanceid',
                    operators: ['=', '!=', ':', '!:'],
                    propertyLabel: 'Instance ID',
                    groupValuesLabel: 'Instance ID values'
                  },
                  {
                    key: 'state',
                    operators: ['=', '!=', ':', '!:'],
                    propertyLabel: 'State',
                    groupValuesLabel: 'State values'
                  },
                  {
                    key: 'instancetype',
                    operators: ['=', '!=', ':', '!:'],
                    propertyLabel: 'Instance type',
                    groupValuesLabel: 'Instance type values'
                  },
                  {
                    key: 'averagelatency',
                    operators: ['=', '!=', '>', '<', '<=', '>='],
                    propertyLabel: 'Average latency',
                    groupValuesLabel: 'Average latency values'
                  }
                ]}
              />
              <ExpandableSection header="Accountability">
                <Cards
                  items={[
                    {
                      id: '1',
                      type: 'Accountability',
                      name: 'Example dashboard',
                      description:
                        'This is an example dashboard to show case the usage of Performance Dashboard on AWS',
                      image: '/image.svg'
                    },
                    {
                      id: '1',
                      type: 'Accountability',
                      name: 'Example dashboard',
                      description:
                        'This is an example dashboard to show case the usage of Performance Dashboard on AWS',
                      image: '/image.svg'
                    },
                    {
                      id: '1',
                      type: 'Accountability',
                      name: 'Example dashboard',
                      description:
                        'This is an example dashboard to show case the usage of Performance Dashboard on AWS',
                      image: '/image.svg'
                    },
                    {
                      id: '1',
                      type: 'Accountability',
                      name: 'Example dashboard',
                      description:
                        'This is an example dashboard to show case the usage of Performance Dashboard on AWS',
                      image: '/image.svg'
                    }
                  ]}
                  cardDefinition={{
                    header: (e) => e.name,
                    sections: [
                      {
                        id: 'description',
                        header: 'Description',
                        content: (e) => e.description
                      },
                      {
                        id: 'type',
                        header: 'Type',
                        content: (e) => e.type
                      }
                    ]
                  }}
                ></Cards>
              </ExpandableSection>
              <ExpandableSection header="Finance">
                <Cards
                  items={[
                    {
                      id: '1',
                      type: 'Accountability',
                      name: 'Example dashboard',
                      description:
                        'This is an example dashboard to show case the usage of Performance Dashboard on AWS',
                      image: '/image.svg'
                    },
                    {
                      id: '1',
                      type: 'Accountability',
                      name: 'Example dashboard',
                      description:
                        'This is an example dashboard to show case the usage of Performance Dashboard on AWS',
                      image: '/image.svg'
                    },
                    {
                      id: '1',
                      type: 'Accountability',
                      name: 'Example dashboard',
                      description:
                        'This is an example dashboard to show case the usage of Performance Dashboard on AWS',
                      image: '/image.svg'
                    },
                    {
                      id: '1',
                      type: 'Accountability',
                      name: 'Example dashboard',
                      description:
                        'This is an example dashboard to show case the usage of Performance Dashboard on AWS',
                      image: '/image.svg'
                    }
                  ]}
                  cardDefinition={{
                    header: (e) => e.name,
                    sections: [
                      {
                        id: 'description',
                        header: 'Description',
                        content: (e) => e.description
                      },
                      {
                        id: 'type',
                        header: 'Type',
                        content: (e) => e.type
                      }
                    ]
                  }}
                ></Cards>
              </ExpandableSection>
            </SpaceBetween>
          </div>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
