import { Box, Button } from '@awsui/components-react';

/**
 * Displays the no match state of any table
 * @param item - type of item that the table displays
 * @example
 * ```
 * {propertyFiltering: {noMatch: (TableNoMatchDisplay("workspace"))}
 * // Displays "No matches" title
 * // "No workspaces match filter."
 * ```
 * @returns no match information
 */
export function TableNoMatchDisplay(item: string) {
  return (
    <Box textAlign="center" color="inherit">
      <b>No matches</b>
      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
        No {item}s match filter.
      </Box>
      <Button>Clear filter</Button>
    </Box>
  );
}
