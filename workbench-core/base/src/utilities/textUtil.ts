/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { v4 as uuidv4 } from 'uuid';
import resourceTypeToKey from '../constants/resourceTypeToKey';

function uuidWithLowercasePrefix(prefix: string): string {
  return `${prefix.toLowerCase()}-${uuidv4()}`;
}

const emtpyStringAsString: string = '^$';
const uuidRegExpAsString: string = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

const nonHTMLMessage: string = 'must not contain any of <>{}';
const nonHtmlRegExpAsString: string = '^([^<>{}]*)$';

const swbNameMessage: string = 'must contain only letters, numbers, hyphens, underscores, and periods';
const swbNameRegExpAsString: string = ['^[A-Za-z0-9-_.]+$', emtpyStringAsString].join('|');
const swbNameMaxLength: number = 112;

const personNameMessage: string = 'must contain only letters, spaces, numbers, hyphens, and periods';
const personNameRegExpAsString: string = '^[A-Za-z0-9-. ]+$';
const personNameMaxLength: number = 50;

const swbDescriptionMessage: string =
  'must contain only letters, numbers, hyphens, underscores, periods, and spaces';
const swbDescriptionRegExpAsString: string = ['^[A-Za-z0-9-_. ]+$', emtpyStringAsString].join('|');
const swbDescriptionMaxLength: number = 400;

const externalIdMessage: string =
  'must contain only letters, numbers, hyphens, underscores, plus, equal, comma, period, at (@), colon (:), and forward slash (/). String length must be between 2 and 400 characters inclusively';
const externalIdRegExpAsString: string = '^[A-Za-z0-9-_+=,.@:\\/]{2,400}$';

const nonEmptyMessage: string = 'optional, but cannot be empty if included';
const invalidIdMessage: string = 'Invalid ID';
const invalidEmailMessage: string = 'Invalid Email';
const requiredMessage: string = 'Required';
const urlFilterMaxLength: number = 128;
const betweenFilterMessage: string = 'value1 must be less than or equal to value2';

const groupIDRegExpAsString: string = '\\S{1,128}';

const awsAccountIdMessage: string = 'must be a 12 digit number';
const awsAccountIdRegExpAsString: string = '^[0-9]{12}$';

const envMgmtRoleArnMessage: string = 'must be a valid envMgmtRoleArn';
const envMgmtRoleArnRegExpAsString: string = '^arn:aws:iam::[0-9]{12}:role\\/[\\w-]+-env-mgmt$';
const envMgmtRoleArnMaxLength: number = 400;

const hostingAccountHandlerRoleArnMessage: string = 'must be a valid hostingAccountHandlerRoleArn';
const hostingAccountHandlerRoleArnRegExpAsString: string =
  '^arn:aws:iam::[0-9]{12}:role\\/[\\w-]+hosting-account-role$';
const hostingAccountHandlerRoleArnMaxLength: number = 400;

const awsRegionMessage: string = 'must be valid AWS region';
const awsRegionRegExpAsString: string = '^(us|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\\d$';

const productIdRegExpString: string = 'prod-[0-9a-zA-Z]{13}';

const provisionArtifactIdRegExpString: string = 'pa-[0-9a-zA-Z]{13}';
const validSshKeyUuidRegExpAsString: string = '[0-9a-f]{64}';

const envTypeIdRegExpString: string = `^${resourceTypeToKey.envType.toLowerCase()}-${productIdRegExpString},${provisionArtifactIdRegExpString}$`;
const envTypeConfigIdRegExpString: string = `^${resourceTypeToKey.envTypeConfig.toLowerCase()}-${uuidRegExpAsString}$`;
const projIdRegExpString: string = `^${resourceTypeToKey.project.toLowerCase()}-${uuidRegExpAsString}$`;
const envIdRegExpString: string = `^${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExpAsString}$`;
const costCenterIdRegExpString: string = `^${resourceTypeToKey.costCenter.toLowerCase()}-${uuidRegExpAsString}$`;
const accountIdRegExpString: string = `^${resourceTypeToKey.account.toLowerCase()}-${uuidRegExpAsString}$`;
const datasetIdRegExpString: string = `^${resourceTypeToKey.dataset.toLowerCase()}-${uuidRegExpAsString}$`;
const sshKeyIdRegExpString: string = `^${resourceTypeToKey.sshKey.toLowerCase()}-${validSshKeyUuidRegExpAsString}$`;
const userIdRegExpString: string = `^${uuidRegExpAsString}$`;

// eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
const uuidRegExp: RegExp = new RegExp(uuidRegExpAsString);

function lengthValidationMessage(length: number): string {
  return `Input must be ${length} characters or less`;
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

function personNameRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(personNameRegExpAsString);
}

function swbDescriptionRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(swbDescriptionRegExpAsString);
}

function etIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(envTypeIdRegExpString);
}

function etcIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(envTypeConfigIdRegExpString);
}

function projIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(projIdRegExpString);
}

function datasetIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(datasetIdRegExpString);
}

function envIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(envIdRegExpString);
}

function costCenterIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(costCenterIdRegExpString);
}

function accountIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(accountIdRegExpString);
}

function externalIdRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(externalIdRegExpAsString);
}

function awsRegionRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(awsRegionRegExpAsString);
}

function awsAccountIdRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(awsAccountIdRegExpAsString);
}

function envMgmtRoleArnRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(envMgmtRoleArnRegExpAsString);
}

function hostingAccountHandlerRoleArnRegExp(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(hostingAccountHandlerRoleArnRegExpAsString);
}

function sshKeyIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(sshKeyIdRegExpString);
}

function userIdRegex(): RegExp {
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
  return new RegExp(userIdRegExpString);
}

const validRolesRegExpAsString: string = '(ProjectAdmin|Researcher)';

export {
  uuidWithLowercasePrefix,
  uuidRegExp,
  uuidWithLowercasePrefixRegExp,
  nonHTMLMessage,
  nonHtmlRegExp,
  swbNameMessage,
  swbNameRegExp,
  swbNameMaxLength,
  personNameMessage,
  personNameRegExp,
  personNameMaxLength,
  swbDescriptionMessage,
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
  awsRegionMessage,
  awsRegionRegex,
  etcIdRegex,
  projIdRegex,
  envIdRegex,
  costCenterIdRegex,
  accountIdRegex,
  nonEmptyMessage,
  invalidIdMessage,
  invalidEmailMessage,
  requiredMessage,
  urlFilterMaxLength,
  betweenFilterMessage,
  lengthValidationMessage,
  sshKeyIdRegex,
  userIdRegex,
  datasetIdRegex,
  envMgmtRoleArnRegExp,
  envMgmtRoleArnMessage,
  envMgmtRoleArnMaxLength,
  hostingAccountHandlerRoleArnMessage,
  hostingAccountHandlerRoleArnRegExp,
  hostingAccountHandlerRoleArnMaxLength,
  externalIdMessage,
  externalIdRegExp
};
