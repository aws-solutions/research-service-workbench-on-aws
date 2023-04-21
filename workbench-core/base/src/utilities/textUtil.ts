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

const nonHTMLValidChar: string = 'must not contain any of <>{}';
const nonHtmlRegExpAsString: string = '^([^<>{}]*)$';

const swbNameValidChar: string = 'must contain only letters, numbers, hyphens, underscores, and periods';
const swbNameRegExpAsString: string = '^[A-Za-z0-9-_.]+$';
const swbNameMaxLength: number = 112;

const swbDescriptionValidChar: string =
  'must contain only letters, numbers, hyphens, underscores, periods, and spaces';
const swbDescriptionRegExpAsString: string = '^[A-Za-z0-9-_. ]+$';
const swbDescriptionMaxLength: number = 400;

const groupIDRegExpAsString: string = '\\S{1,128}';

const productIdRegExpString: string = 'prod-[0-9a-zA-Z]{13}';

const provisionArtifactIdRegExpString: string = 'pa-[0-9a-zA-Z]{13}';

const envTypeIdRegExpString: string = `${resourceTypeToKey.envType.toLowerCase()}-${productIdRegExpString},${provisionArtifactIdRegExpString}`;

// eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
const uuidRegExp: RegExp = new RegExp(uuidRegExpAsString);

function uuidWithLowercasePrefixRegExp(prefix: string): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(`${prefix.toLowerCase()}-${uuidRegExpAsString}$`);
}

function nonHtmlRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(nonHtmlRegExpAsString);
}

function swbNameRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(swbNameRegExpAsString);
}

function swbDescriptionRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(swbDescriptionRegExpAsString);
}

const validRolesRegExpAsString: string = '(ProjectAdmin|Researcher)';

const userGroupRegExpString: string = `(${resourceTypeToKey.project.toLowerCase()}-${uuidRegExpAsString}#${validRolesRegExpAsString}|ITAdmin)`;

const validSshKeyUuidRegExpAsString: string = '[0-9a-f]{64}';

export {
  uuidWithLowercasePrefix,
  uuidRegExp,
  uuidWithLowercasePrefixRegExp,
  nonHTMLValidChar,
  nonHtmlRegExp,
  swbNameValidChar,
  swbNameRegExp,
  swbNameMaxLength,
  swbDescriptionValidChar,
  swbDescriptionRegExp,
  swbDescriptionMaxLength,
  uuidRegExpAsString,
  productIdRegExpString,
  provisionArtifactIdRegExpString,
  envTypeIdRegExpString,
  validRolesRegExpAsString,
  userGroupRegExpString,
  groupIDRegExpAsString,
  validSshKeyUuidRegExpAsString
};
