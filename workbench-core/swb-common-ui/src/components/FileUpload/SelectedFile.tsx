/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Box, Icon, SpaceBetween } from '@cloudscape-design/components';

import React, { LegacyRef, useEffect, useMemo, useRef } from 'react';
import { createUseStyles } from 'react-jss';

import { FileMetadata } from './models/FileUpload';
import { defaultFileMetadata, formatFileLastModified, formatFileSize } from './utils';

interface SelectedFileProps {
  metadata?: FileMetadata;
  file: File;
  className?: string;
  multiple?: boolean;
}

export const SelectedFile: React.FC<SelectedFileProps> = ({
  metadata,
  file,
  multiple = false
}: SelectedFileProps) => {
  const styles = createUseStyles({
    file: {
      minWidth: 0,
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'flex-start',
      gap: '8px'
    },
    fileThumb: {
      maxWidth: '60px'
    },
    fileThumbImg: {
      width: '100%',
      height: 'auto'
    },
    fileMetadata: {
      overflow: 'hidden'
    },
    fileName: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },
    fileType: {
      marginLeft: '5px'
    }
  })();

  const thumbnail: LegacyRef<HTMLImageElement> = useRef(null);
  const baseMetadata = { ...defaultFileMetadata, ...metadata };

  const isImageFile = (file: File): boolean => {
    return !!file.type && file.type.split('/')[0] === 'image';
  };

  const isImg = useMemo(() => isImageFile(file), [file]);

  useEffect(() => {
    if (multiple && baseMetadata.thumbnail && isImg) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (thumbnail.current && thumbnail.current.src) {
          thumbnail.current.src = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }, [multiple, file, baseMetadata.thumbnail, isImg]);

  return (
    <Box className={styles.file}>
      <Icon variant="success" name="status-positive" />
      {baseMetadata.thumbnail && multiple && isImg && (
        <Box className={styles.fileThumb}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.fileThumbImg} alt={file.name} ref={thumbnail} src="" />
        </Box>
      )}
      <Box className={styles.fileMetadata}>
        <SpaceBetween direction="vertical" size="xxxs">
          {baseMetadata.name && file.name && (
            <Box className={styles.fileName}>
              <span title={file.name}>{file.name}</span>
            </Box>
          )}
          {baseMetadata.type && file.type && (
            <Box fontSize="body-s" color="text-body-secondary">
              {file.type}
            </Box>
          )}
          {file.size && (
            <Box fontSize="body-s" color="text-body-secondary">
              {formatFileSize(file.size, baseMetadata)}
            </Box>
          )}
          {baseMetadata.lastModified && file.lastModified && (
            <Box fontSize="body-s" color="text-body-secondary">
              {formatFileLastModified(file.lastModified, baseMetadata)}
            </Box>
          )}
        </SpaceBetween>
      </Box>
    </Box>
  );
};
