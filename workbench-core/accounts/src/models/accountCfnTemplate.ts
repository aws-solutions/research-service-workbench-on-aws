/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

interface TemplateResponse {
  createUrl: string;
  updateUrl: string;
}

interface AccountCfnTemplateParameters {
  accountHandlerRole: string;
  apiHandlerRole: string;
  enableFlowLogs: string;
  externalId: string;
  launchConstraintPolicyPrefix: string;
  launchConstraintRolePrefix: string;
  mainAccountId: string;
  namespace: string;
  stackName: string;
  statusHandlerRole: string;
}

export { AccountCfnTemplateParameters, TemplateResponse };
