/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AppLayoutProps, BarChart, Box, Button, SplitPanelProps } from '@awsui/components-react';
import { useEffect, useState } from 'react';

export const splitPaneli18nstrings: SplitPanelProps.I18nStrings = {
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
};

export const getPanelContent = (items: any, itemType: string): any => {
  if (!items.length) {
    return {
      header: `0 ${itemType}s selected`,
      body: `Select a ${itemType} to see its details`
    };
  }

  const item = items[0];

  // All data returned is dummy data for POC
  return {
    header: 'Cost',
    body: (
      <BarChart
        series={[
          {
            title: 'Workspace cost (last 7 days)',
            type: 'bar',
            data: [
              { x: new Date(1601096400000), y: 0 },
              { x: new Date(1601103600000), y: 34 },
              { x: new Date(1601110800000), y: 340 },
              { x: new Date(1601118000000), y: 41 },
              { x: new Date(1601125200000), y: 33 },
              { x: new Date(1601125200000), y: 40 },
              { x: new Date(1601125200000), y: 120 }
            ],
            valueFormatter: (e) => '$' + e.toLocaleString('en-US')
          },
          {
            title: 'Average cost',
            type: 'threshold',
            y: 87,
            valueFormatter: (e) => '$' + e.toLocaleString('en-US')
          }
        ]}
        xDomain={[
          new Date(1601096400000),
          new Date(1601103600000),
          new Date(1601110800000),
          new Date(1601118000000),
          new Date(1601125200000),
          new Date(1601125200000),
          new Date(1601125200000)
        ]}
        yDomain={[0, 400]}
        i18nStrings={{
          filterLabel: 'Filter displayed data',
          filterPlaceholder: 'Filter data',
          filterSelectedAriaLabel: 'selected',
          legendAriaLabel: 'Legend',
          chartAriaRoleDescription: 'line chart',
          xTickFormatter: (e) =>
            e
              .toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: !1
              })
              .split(',')
              .join('\n'),
          yTickFormatter: undefined
        }}
        ariaLabel="Single data series line chart"
        errorText="Error loading data."
        height={300}
        loadingText="Loading chart"
        recoveryText="Retry"
        xScaleType="categorical"
        xTitle="Time (UTC)"
        yTitle="Revenue (USD)"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No data available</b>
            <Box variant="p" color="inherit">
              There is no data available
            </Box>
          </Box>
        }
        noMatch={
          <Box textAlign="center" color="inherit">
            <b>No matching data</b>
            <Box variant="p" color="inherit">
              There is no matching data to display
            </Box>
            <Button>Clear filter</Button>
          </Box>
        }
      />
    )
  };
};

export const useSplitPanel = (selectedItems: any): AppLayoutProps => {
  const [splitPanelSize, setSplitPanelSize] = useState(650);
  const [splitPanelOpen, setSplitPanelOpen] = useState(false);
  const [hasManuallyClosedOnce, setHasManuallyClosedOnce] = useState(false);

  const onSplitPanelResize = ({ detail: { size } }: any): void => {
    setSplitPanelSize(size);
  };

  const onSplitPanelToggle = ({ detail: { open } }: any): void => {
    setSplitPanelOpen(open);

    if (!open) {
      setHasManuallyClosedOnce(true);
    }
  };

  useEffect(() => {
    if (selectedItems.length && !hasManuallyClosedOnce) {
      setSplitPanelOpen(true);
    }
  }, [selectedItems.length, hasManuallyClosedOnce]);

  return {
    splitPanelOpen,
    onSplitPanelToggle,
    splitPanelSize,
    onSplitPanelResize
  };
};
