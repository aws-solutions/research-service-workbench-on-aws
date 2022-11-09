/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

interface TemplateResponse{
    url: URL;
}

interface AccountCfnTemplateParameters{
    accountHandlerRoleArn : string;
    enableFlowLogs : string;
    externalId : string;
    launchConstraintPolicyPrefix : string;
    launchConstraintRolePrefix : string;
    mainAccountId : string;
    namespace : string;
    publicSubnetCidr : string;
    stackName : string;
    statusHandlerRoleArn : string;
    url : URL;
    vpcCidr : string;
}

export {AccountCfnTemplateParameters, TemplateResponse} ;