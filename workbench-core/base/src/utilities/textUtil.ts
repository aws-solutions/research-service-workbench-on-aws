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

const envTypeIdRegExpString: string = `${resourceTypeToKey.envType.toLowerCase()}-prod-[0-9a-zA-Z]{13},pa-[0-9a-zA-Z]{13}`;

// eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
const uuidRegExp: RegExp = new RegExp(uuidRegExpAsString);

function uuidWithLowercasePrefixRegExp(prefix: string): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(prefix.toLowerCase() + '-' + uuidRegExpAsString);
}

export {
  uuidWithLowercasePrefix,
  uuidRegExp,
  uuidWithLowercasePrefixRegExp,
  uuidRegExpAsString,
  envTypeIdRegExpString
};
