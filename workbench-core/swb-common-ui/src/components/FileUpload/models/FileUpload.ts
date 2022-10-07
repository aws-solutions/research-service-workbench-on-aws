/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export enum FileSize {
  BYTES = 'bytes',
  KB = 'KB',
  KIB = 'KiB',
  MB = 'MB',
  MIB = 'MiB',
  GB = 'GB',
  GIB = 'GiB'
}

export interface FileMetadata {
  /**
   * Show each file name.
   * Default: true
   */
  name?: boolean;
  /**
   * Show the file MIME type.
   * Default: false
   */
  type?: boolean;
  /**
   * Show file size expressed in bytes, KB, MB, GB, KiB, MiB, or GiB.
   */
  size?: FileSize;
  /**
   * Show the file last modified date.
   * Default: false
   */
  lastModified?: boolean;
  /**
   * Show file thumbnail in multiple files upload case only.
   * Default: false
   */
  thumbnail?: boolean;
}

export interface DismissDetail {
  index: number;
  file: File;
}

export interface ChangeDetail {
  value?: File | File[];
}
