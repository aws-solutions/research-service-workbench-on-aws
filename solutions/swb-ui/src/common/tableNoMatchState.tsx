/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Box, Button } from '@awsui/components-react';

/**
 * Displays the no match state of any table
 * @param itemType - type of item that the table displays
 * @example
 * ```
 * {propertyFiltering: {noMatch: (TableNoMatchDisplay("workspace"))}
 * // Displays "No matches" title
 * // "No workspaces match filter."
 * ```
 * @returns no match information
 */
export function TableNoMatchDisplay(itemType: string): JSX.Element {
  return (
    <Box textAlign="center" color="inherit">
      <b>No matches</b>
      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
        No {itemType}s match filter.
      </Box>
    </Box>
  );
}
