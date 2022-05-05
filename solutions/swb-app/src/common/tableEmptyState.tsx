import { Box, Button } from '@awsui/components-react';

/**
 * Displays the empty state of any table
 * @param item - type of item that the table displays
 * @example
 * ```
 * <Table empty={ TableEmptyDisplay("workspace") } />
 * // Displays "No workspaces" title
 * // "No workspaces to display."
 * // <Button> with "Create workspace"
 * ```
 * @returns empty table information and call to action
 */
export function TableEmptyDisplay(item: string) {
  return (
    <Box textAlign="center" color="inherit">
      <b>No {item}s</b>
      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
        No {item}s to display.
      </Box>
      <Button>Create {item}</Button>
    </Box>
  );
}
