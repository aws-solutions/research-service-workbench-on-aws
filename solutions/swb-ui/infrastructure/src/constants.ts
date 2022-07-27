/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import { join } from 'path';

function getConstants(): {
  STAGE: string;
  API_BASE_URL: string;
  AWS_REGION: string;
  STACK_NAME: string;
  S3_ACCESS_LOGS_BUCKET_PREFIX: string;
  S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY: string;
  S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: string;
  S3_ARTIFACT_BUCKET_NAME: string;
  S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME: string;
  ACCESS_IDENTITY_ARTIFACT_NAME: string;
  DISTRIBUTION_ARTIFACT_NAME: string;
  DISTRIBUTION_ARTIFACT_DOMAIN: string;
  DISTRIBUTION_FUNCTION_ARTIFACT_NAME: string;
  DISTRIBUTION_FUNCTION_NAME: string;
  RESPONSE_HEADERS_ARTIFACT_NAME: string;
  RESPONSE_HEADERS_NAME: string;
} {
  const config = getAPIOutputs();
  const STAGE = process.env.STAGE || '';
  const namePrefix = `swb-ui-${process.env.STAGE}-${config.awsRegionShortName}`;
  const API_BASE_URL = config.apiUrlOutput?.replace('/dev/', '') || '';
  const AWS_REGION = config.awsRegion;
  const STACK_NAME = namePrefix;
  const S3_ARTIFACT_BUCKET_NAME = `${namePrefix}-bucket`;
  const S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME = `${namePrefix}-deployment-bucket`;
  const ACCESS_IDENTITY_ARTIFACT_NAME = `${namePrefix}-origin-access-identity`;
  const DISTRIBUTION_ARTIFACT_NAME = `${namePrefix}-distribution`;
  const DISTRIBUTION_ARTIFACT_DOMAIN = 'WebsiteURL';
  const DISTRIBUTION_FUNCTION_ARTIFACT_NAME = `${namePrefix}-redirect-distribution-function`;
  const DISTRIBUTION_FUNCTION_NAME = `${namePrefix}-RedirectRoutingFunction`;
  const RESPONSE_HEADERS_ARTIFACT_NAME = `${namePrefix}-response-header-policy`;
  const RESPONSE_HEADERS_NAME = `${namePrefix}-SWBResponseHeadersPolicy`;
  const S3_ACCESS_LOGS_BUCKET_PREFIX = 'service-workbench-access-log';

  // CloudFormation Output Keys
  const S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY = 'S3BucketArtifactsArnOutput';
  // The output name below must match the value in swb-reference
  const S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY = 'S3BucketAccessLogsNameOutput';

  return {
    STAGE,
    API_BASE_URL,
    AWS_REGION,
    STACK_NAME,
    S3_ACCESS_LOGS_BUCKET_PREFIX,
    S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY,
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
    S3_ARTIFACT_BUCKET_NAME,
    S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME,
    ACCESS_IDENTITY_ARTIFACT_NAME,
    DISTRIBUTION_ARTIFACT_NAME,
    DISTRIBUTION_ARTIFACT_DOMAIN,
    DISTRIBUTION_FUNCTION_ARTIFACT_NAME,
    DISTRIBUTION_FUNCTION_NAME,
    RESPONSE_HEADERS_ARTIFACT_NAME,
    RESPONSE_HEADERS_NAME
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAPIOutputs(): { awsRegionShortName: string; apiUrlOutput: string; awsRegion: string } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiStackOutputs: any = JSON.parse(
      // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
      // correct file
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(join(__dirname, `../../../swb-reference/src/config/${process.env.STAGE}.js`), 'utf8') // nosemgrep
    );
    const apiStackName = Object.entries(apiStackOutputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
    // eslint-disable-next-line security/detect-object-injection
    const outputs = apiStackOutputs[apiStackName];

    if (!outputs.awsRegionShortName || !outputs.apiUrlOutput || !outputs.awsRegion) {
      throw `Configuration file for ${process.env.STAGE} was found with incorrect format. Please deploy application swb-reference and try again.`; //validate when API unsuccessfully finished and UI is deployed
    }
    return {
      awsRegionShortName: outputs.awsRegionShortName,
      apiUrlOutput: outputs.apiUrlOutput,
      awsRegion: outputs.awsRegion
    };
  } catch {
    console.error(
      `No API Stack deployed found for ${process.env.STAGE}.Please deploy application swb-reference and try again.`
    );
    throw `No API Stack deployed found for ${process.env.STAGE}.`;
  }
}

export { getConstants };
