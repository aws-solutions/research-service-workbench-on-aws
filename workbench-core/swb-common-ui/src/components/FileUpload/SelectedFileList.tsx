/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Box, Button, SpaceBetween } from '@cloudscape-design/components';

import React from 'react';
import { createUseStyles } from 'react-jss';

import { DismissDetail, FileMetadata } from './models/FileUpload';
import { SelectedFile } from './SelectedFile';
import { defaultFileMetadata } from './utils';

interface SelectedFileListProps {
  metadata?: FileMetadata;
  fileList: File[];
  onDismiss: (event: CustomEvent<DismissDetail>) => void;
}

export const SelectedFileList: React.FC<SelectedFileListProps> = ({
  metadata,
  fileList,
  onDismiss
}: SelectedFileListProps) => {
  const styles = createUseStyles({
    token: {
      alignItems: 'flex-start',
      borderRadius: '2px',
      boxSizing: 'border-box',
      display: 'flex',
      height: '100%',
      padding: '4px 4px 4px 8px'
    },
    dismissButton: {
      backgroundColor: 'initial',
      border: '1px solid #0000',
      marginLeft: 'auto',
      padding: '0 4px'
    }
  })();

  const baseMetadata = { ...defaultFileMetadata, ...metadata };

  const handleClick =
    (index: number, file: File): (() => void) =>
    () =>
      onDismiss && onDismiss(new CustomEvent<DismissDetail>('dismiss', { detail: { index, file } }));

  const items = fileList.map((file: File, idx: number) => {
    return (
      <Box className={styles.token} key={idx}>
        <SelectedFile key={idx} file={file} metadata={baseMetadata} multiple={true} />
        <Button
          variant="icon"
          iconName="close"
          className={styles.dismissButton}
          onClick={handleClick(idx, file)}
        />
      </Box>
    );
  });

  return (
    <SpaceBetween direction="vertical" size="xs">
      {items}
    </SpaceBetween>
  );
};
