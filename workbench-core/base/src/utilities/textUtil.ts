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

const nonEmptyMessage: string = 'Cannot be empty';
const invalidIdMessage: string = 'Invalid ID';
const requiredMessage: string = 'Required';
const urlFilterMaxLength: number = 128;

const groupIDRegExpAsString: string = '\\S{1,128}';

const awsAccountIdMessage: string = 'must be a 12 digit number';
const awsAccountIdRegExpAsString: string = '^[0-9]{12}$';

const productIdRegExpString: string = 'prod-[0-9a-zA-Z]{13}';

const provisionArtifactIdRegExpString: string = 'pa-[0-9a-zA-Z]{13}';
const validSshKeyUuidRegExpAsString: string = '[0-9a-f]{64}';

const envTypeIdRegExpString: string = `${resourceTypeToKey.envType.toLowerCase()}-${productIdRegExpString},${provisionArtifactIdRegExpString}`;
const envTypeConfigIdRegExpString: string = `${resourceTypeToKey.envTypeConfig.toLowerCase()}-${uuidRegExpAsString}`;
const projIdRegExpString: string = `${resourceTypeToKey.project.toLowerCase()}-${uuidRegExpAsString}`;
const envIdRegExpString: string = `${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExpAsString}`;
const sshKeyIdRegExpString: string = `${resourceTypeToKey.sshKey.toLowerCase()}-${validSshKeyUuidRegExpAsString}`;

// eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
const uuidRegExp: RegExp = new RegExp(uuidRegExpAsString);

function lengthValidationMessage(length: number): string {
  return `Input must be less than ${length} characters`;
}

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

function etIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(`^${envTypeIdRegExpString}$`);
}

function etcIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(`^${envTypeConfigIdRegExpString}$`);
}

function projIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(`^${projIdRegExpString}$`);
}

function envIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(`^${envIdRegExpString}$`);
}
function awsAccountIdRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(awsAccountIdRegExpAsString);
}

function sshKeyIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(`^${sshKeyIdRegExpString}$`);
}

const validRolesRegExpAsString: string = '(ProjectAdmin|Researcher)';

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
  envTypeConfigIdRegExpString,
  validRolesRegExpAsString,
  groupIDRegExpAsString,
  validSshKeyUuidRegExpAsString,
  etIdRegex,
  awsAccountIdMessage,
  awsAccountIdRegExp,
  etcIdRegex,
  projIdRegex,
  envIdRegex,
  nonEmptyMessage,
  invalidIdMessage,
  requiredMessage,
  urlFilterMaxLength,
  lengthValidationMessage,
  sshKeyIdRegex
};
