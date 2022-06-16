import { S3 } from '@aws-sdk/client-s3';

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
        Body: file.fileContent
      };
      await this._s3.putObject(putObjectParam);
    }
  }
}
