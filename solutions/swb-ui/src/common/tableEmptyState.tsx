import { Box, Button } from '@awsui/components-react';

/**
 * Displays the empty state of any table
 * @param itemType - type of item that the table displays
 * @param link - relative url to page for creating "itemType"
 * @example
 * ```
 * <Table empty={ TableEmptyDisplay("workspace") } />
 * // Displays "No workspaces" title
 * // "No workspaces to display."
 * // <Button> with "Create workspace" text
 * ```
 * @returns empty table information and call to action
 */
export function TableEmptyDisplay(itemType: string, link: string = ''): JSX.Element {
  return (
    <Box textAlign="center" color="inherit">
      <b>No {itemType}s</b>
      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
        No {itemType}s to display.
      </Box>
      <Button href={link}>Create {itemType}</Button>
    </Box>
  );
}
