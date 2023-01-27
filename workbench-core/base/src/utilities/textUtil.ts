/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { v4 as uuidv4 } from 'uuid';
import resourceTypeToKey from '../constants/resourceTypeToKey';

function uuidWithLowercasePrefix(prefix: string): string {
  return `${prefix.toLowerCase()}-${uuidv4()}`;
}
const uuidRegExpAsString: string = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

const groupIDRegExpAsString: string = '\\S{1,128}';

const productIdRegExpString: string = 'prod-[0-9a-zA-Z]{13}';

const provisionArtifactIdRegExpString: string = 'pa-[0-9a-zA-Z]{13}';

const envTypeIdRegExpString: string = `${resourceTypeToKey.envType.toLowerCase()}-${productIdRegExpString},${provisionArtifactIdRegExpString}`;

// eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
const uuidRegExp: RegExp = new RegExp(uuidRegExpAsString);

function uuidWithLowercasePrefixRegExp(prefix: string): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(prefix.toLowerCase() + '-' + uuidRegExpAsString);
}

const validRolesRegExpAsString: string = '(ProjectAdmin|Researcher)';

export {
  uuidWithLowercasePrefix,
  uuidRegExp,
  uuidWithLowercasePrefixRegExp,
  uuidRegExpAsString,
  productIdRegExpString,
  provisionArtifactIdRegExpString,
  envTypeIdRegExpString,
  validRolesRegExpAsString,
  groupIDRegExpAsString
};
