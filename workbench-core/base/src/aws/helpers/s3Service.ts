/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { PutObjectCommand, S3, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import yaml from 'js-yaml';
import { schema } from 'yaml-cfn';
import { CFNTemplate } from './cloudFormationTemplate';

export default class S3Service {
  private _s3: S3;
  public constructor(s3: S3) {
    this._s3 = s3;
  }

  /**
   * Upload files to S3
   * @param s3BucketArn - The arn of the S3 bucket to place the files in
   * @param files -
   *    fileContent: the file buffer of what you want to upload,
   *    s3Prefix: where you want to upload the file within  the s3 bucket,
   *    fileName: the name you want to give the file in s3
   */
  public async uploadFiles(
    s3BucketArn: string,
    files: Array<{ fileContent: Buffer; s3Prefix: string; fileName: string }>
  ): Promise<void> {
    for (const file of files) {
      const s3BucketName = s3BucketArn.split(':').pop() as string;
      const putObjectParam = {
        Bucket: s3BucketName,
        Key: `${file.s3Prefix}${file.fileName}`,
        Body: file.fileContent,
        ExpectedBucketOwner: process.env.MAIN_ACCT_ID
      };
      await this._s3.putObject(putObjectParam);
    }
  }

  /**
   * Upload an entire folder with contained files as-is to S3
   *
   * Warnings for developers:
   * 1. This is not a solution to offer customers for remote file upload.
   *     This is only to be used from the application deployer's local machine (eg. during post deployment)
   * 2. When using, account for this method's limitations for scenarios where:
   *  - network/lambda timeouts might occur for larger folder/long operations
   *  - maximum single file size is limited to 5GB even if your connection can handle the time needed.
   *
   * @param s3BucketName - The name of the S3 bucket to place the folder in
   * @param prefix - The key name to create in S3 for this folder
   * @param path - The full local directory path in local system of the folder
   */
  public async uploadFolder(s3BucketName: string, prefix: string, path: string): Promise<void> {
    const recursiveUpload = async (path: string, dirName: string): Promise<void> => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const fileAndDirInCurrFolder = fs.readdirSync(path);
      for (const name of fileAndDirInCurrFolder) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const isDirectory = fs.lstatSync(join(path, name)).isDirectory();
        if (isDirectory) {
          await recursiveUpload(join(path, name), `${dirName}${name}/`);
        } else {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          const fileContent = fs.readFileSync(`${path}/${name}`);
          const putObjectParam = {
            Bucket: s3BucketName,
            Key: `${prefix}${dirName}${name}`,
            Body: fileContent,
            ExpectedBucketOwner: process.env.MAIN_ACCT_ID
          };

          await this._s3.putObject(putObjectParam);
        }
      }
    };

    await recursiveUpload(path, '');
  }

  /**
   * Read Template from Bucket
   * @param s3BucketURL - URL of provision artifact template
   * @returns json object containing yaml file configuration
   */
  public async getTemplateByURL(s3BucketURL: string): Promise<CFNTemplate> {
    const s3BucketParams = s3BucketURL.split('.s3.amazonaws.com/');
    if (s3BucketParams.length !== 2) throw new Error(`Invalid S3 URL format ${s3BucketURL}`);
    const s3Bucket = s3BucketParams[0].replace('https://', '');
    const key = s3BucketParams[1];
    const stream = await this._s3.getObject({
      Bucket: s3Bucket,
      Key: key,
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    });
    const streamString = await this._streamToString(stream.Body! as Readable);
    const yamlFile = await yaml.load(streamString, { schema: schema });
    return yamlFile as CFNTemplate;
  }

  /**
   * Parse stream into string with utf8
   * @param stream - stream to parse
   * @returns string with stream content
   */
  private async _streamToString(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }

  /**
   * Get a presigned URL for a GetObjectCommand
   * @param s3bucketName - name of the bucket
   * @param key - name of the file to get from the bucket
   * @param expirationSeconds - expiration in seconds of the presigned URL
   *
   * @returns A presigned URL
   */
  public async getPresignedUrl(
    s3BucketName: string,
    key: string,
    expirationSeconds: number
  ): Promise<string> {
    // Sign the url
    const command = new GetObjectCommand({
      Bucket: s3BucketName,
      Key: key,
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    });
    return getSignedUrl(this._s3, command, { expiresIn: expirationSeconds });
  }

  /**
   * Create a presigned URL for a signle-part file upload
   * @param s3BucketName - the name of the s3 bucket
   * @param prefix - the s3 prefix to upload to
   * @param timeToLiveSeconds - length of time (in seconds) the URL is valid.
   * @returns the presigned URL
   */
  public async createPresignedUploadUrl(
    s3BucketName: string,
    prefix: string,
    timeToLiveSeconds: number
  ): Promise<string> {
    return await getSignedUrl(
      this._s3,
      new PutObjectCommand({
        Bucket: s3BucketName,
        Key: prefix,
        ExpectedBucketOwner: process.env.MAIN_ACCT_ID
      }),
      {
        expiresIn: timeToLiveSeconds
      }
    );
  }
}
