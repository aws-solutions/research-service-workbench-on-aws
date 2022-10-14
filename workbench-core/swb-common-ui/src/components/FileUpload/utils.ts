/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { FileMetadata, FileSize } from './models/FileUpload';

export const defaultFileMetadata: FileMetadata = {
  name: true,
  type: false,
  lastModified: false,
  thumbnail: false
};

export const convertBytesTo = (bytes: number, unit: FileSize): number => {
  switch (unit) {
    // Decimal
    case FileSize.KB: {
      return bytes / 1000;
    }
    case FileSize.MB: {
      return bytes / 1000 ** 2;
    }
    case FileSize.GB: {
      return bytes / 1000 ** 3;
    }
    // Binary
    case FileSize.KIB: {
      return bytes / 1024;
    }
    case FileSize.MIB: {
      return bytes / 1024 ** 2;
    }
    case FileSize.GIB: {
      return bytes / 1024 ** 3;
    }
    // Default
    case FileSize.BYTES:
    default: {
      return bytes;
    }
  }
};

export const formatFileSize = (size: number, metadata: FileMetadata): React.ReactNode => {
  if (!size) {
    return null;
  }

  if (metadata.size) {
    const convertedSize = convertBytesTo(size, metadata.size).toFixed(2);
    return `${convertedSize} ${metadata.size}`;
  }

  let fileSize: FileSize;
  if (size < 1024) {
    fileSize = FileSize.BYTES;
  } else if (size < 1024 ** 2) {
    fileSize = FileSize.KIB;
  } else if (size < 1024 ** 3) {
    fileSize = FileSize.MIB;
  } else {
    fileSize = FileSize.GIB;
  }

  const convertedSize = convertBytesTo(size, fileSize).toFixed(2);
  return `${convertedSize} ${fileSize}`;
};

export const formatFileLastModified = (rawDate: number, metadata: FileMetadata): React.ReactNode => {
  if (!metadata.lastModified || !rawDate) {
    return null;
  }
  const date = new Date(rawDate);
  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    hour12: false
  });
  return `${dateStr} ${timeStr}`;
};
