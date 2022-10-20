/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AttachedPolicy,
  GetRolePolicyCommandInput,
  ListAttachedRolePoliciesCommandOutput,
  ListRolePoliciesCommandOutput,
  Role,
  NoSuchEntityException
} from '@aws-sdk/client-iam';
import AwsService from '../aws/awsService';

export class IamRoleCloneService {
  private _sourceAccount: AwsService;
  private _targetAccount: AwsService;

  public constructor(sourceAccount: AwsService, targetAccount: AwsService) {
    this._sourceAccount = sourceAccount;
    this._targetAccount = targetAccount;
  }

  public async cloneRole(roleName: string): Promise<void> {
    await this._copyRole(roleName);
    await this._copyInlinePolicies(roleName);
    await this._copyManagedPolicies(roleName);
    await this._detachPoliciesThatAreNotMatching(roleName);
  }

  private async _detachPoliciesThatAreNotMatching(roleName: string): Promise<void> {
    console.log(`Detaching policies that are not matching for role ${roleName}`);
    const sourceManagedPolicies = await this._getAllManagedRolePolicies(roleName, this._sourceAccount);
    const targetManagedPolicies = await this._getAllManagedRolePolicies(roleName, this._targetAccount);

    const sourceAttachedPolicyNames = sourceManagedPolicies.map((policy) => {
      return policy.PolicyName;
    });
    const extraPoliciesInTargetAccount = targetManagedPolicies.filter((targetPolicy) => {
      return !sourceAttachedPolicyNames.includes(targetPolicy.PolicyName);
    });
    console.log(
      `Detaching policies ${extraPoliciesInTargetAccount.map((policy) => {
        return policy.PolicyName;
      })}`
    );

    for (const policy of extraPoliciesInTargetAccount) {
      await this._targetAccount.clients.iam.detachRolePolicy({
        RoleName: roleName,
        PolicyArn: policy.PolicyArn
      });
    }

    const sourceInlinePolicies = await this._getAllInlineRolePoliciesName(roleName, this._sourceAccount);
    const targetInlinePolicies = await this._getAllInlineRolePoliciesName(roleName, this._targetAccount);

    const extraInlinePoliciesInTargetAccount = targetInlinePolicies.filter((policyName) => {
      return !sourceInlinePolicies.includes(policyName);
    });

    for (const policyName of extraInlinePoliciesInTargetAccount) {
      await this._targetAccount.clients.iam.deleteRolePolicy({
        PolicyName: policyName,
        RoleName: roleName
      });
    }
  }

  private async _copyRole(roleName: string): Promise<void> {
    console.log(`Copying role ${roleName} to target account`);
    const { Role: sourceRole } = await this._sourceAccount.clients.iam.getRole({
      RoleName: roleName
    });

    let targetRole: Role;
    try {
      const response = await this._targetAccount.clients.iam.getRole({
        RoleName: roleName
      });

      targetRole = response.Role!;
    } catch (e) {
      console.warn(e);
      if (e instanceof NoSuchEntityException) {
        console.log('Creating target role because target role does not exist in hosting account');
        if (sourceRole) {
          const response = await this._targetAccount.clients.iam.createRole({
            RoleName: roleName,
            AssumeRolePolicyDocument: sourceRole.AssumeRolePolicyDocument
              ? decodeURIComponent(sourceRole.AssumeRolePolicyDocument)
              : undefined,
            Path: sourceRole.Path,
            Description: sourceRole.Description,
            MaxSessionDuration: sourceRole.MaxSessionDuration,
            Tags: sourceRole.Tags
          });
          targetRole = response.Role!;
        }
      }
    }

    // Check if role's AssumeRolePolicyDocument needs to be updated
    const sourceRoleAssumeRolePolicyDocument = sourceRole!.AssumeRolePolicyDocument
      ? decodeURIComponent(sourceRole!.AssumeRolePolicyDocument)
      : undefined;
    const targetRoleAssumeRolePolicyDocument = targetRole!.AssumeRolePolicyDocument
      ? decodeURIComponent(targetRole!.AssumeRolePolicyDocument)
      : undefined;
    if (sourceRoleAssumeRolePolicyDocument !== targetRoleAssumeRolePolicyDocument) {
      console.log('Updating target role assumeRolePolicyDocument');
      await this._targetAccount.clients.iam.updateAssumeRolePolicy({
        RoleName: roleName,
        PolicyDocument: sourceRole!.AssumeRolePolicyDocument
      });
    }
  }

  private async _copyInlinePolicies(roleName: string): Promise<void> {
    console.log(`Copying inline policies for role ${roleName}`);
    const inlinePoliciesToAddToTargetAccount = await this._getInlinePoliciesToAddToTargetAccount(roleName);
    console.log(
      `Adding Inline Policies ${inlinePoliciesToAddToTargetAccount.map((policy) => {
        return policy.policyName;
      })}`
    );
    for (const policyToAdd of inlinePoliciesToAddToTargetAccount) {
      await this._targetAccount.clients.iam.putRolePolicy({
        RoleName: roleName,
        PolicyName: policyToAdd.policyName,
        PolicyDocument: decodeURIComponent(policyToAdd.policyDocument)
      });
    }
  }

  private async _copyManagedPolicies(roleName: string): Promise<void> {
    console.log(`Copying managed policies for role ${roleName}`);
    const srcManagedPolicies = await this._getAllManagedRolePolicies(roleName, this._sourceAccount);
    const targetManagedPolicies = await this._getAllManagedRolePolicies(roleName, this._targetAccount);

    let targetPolicyArns: string[] = [];
    if (targetManagedPolicies) {
      targetPolicyArns = targetManagedPolicies.map((attachedPolicy) => {
        return attachedPolicy.PolicyArn!;
      });
    }
    if (srcManagedPolicies) {
      const managedPoliciesNotInTargetAccount = srcManagedPolicies.filter((attachedPolicy) => {
        return !targetPolicyArns.includes(attachedPolicy.PolicyArn!);
      });
      console.log(
        `Adding managedPolicies ${managedPoliciesNotInTargetAccount.map((attachedPolicy) => {
          return attachedPolicy.PolicyArn;
        })}`
      );
      // All AWS managed policy arns have 'aws' in place of account number. E.g., "arn:aws:iam::aws:policy/AmazonEC2FullAccess")
      // Customer managed policies have account number in ARN, for example: arn:aws:iam::123456789012:policy/SomeCustomerManagedPolicyName
      const awsManagedPolicies = managedPoliciesNotInTargetAccount.filter((policy: AttachedPolicy) => {
        return policy.PolicyArn!.split(':')[4] === 'aws';
      });
      const customerManagedPolicies = managedPoliciesNotInTargetAccount.filter((policy: AttachedPolicy) => {
        return policy.PolicyArn!.split(':')[4] !== 'aws';
      });

      for (const policy of awsManagedPolicies) {
        await this._targetAccount.clients.iam.attachRolePolicy({
          RoleName: roleName,
          PolicyArn: policy.PolicyArn
        });
      }

      for (const policy of customerManagedPolicies) {
        const { Policy: policyInfo } = await this._sourceAccount.clients.iam.getPolicy({
          PolicyArn: policy.PolicyArn
        });
        if (policyInfo) {
          const { PolicyVersion: policyVersionInfo } = await this._sourceAccount.clients.iam.getPolicyVersion(
            {
              PolicyArn: policy.PolicyArn,
              VersionId: policyInfo.DefaultVersionId
            }
          );
          const { Policy: targetPolicy } = await this._targetAccount.clients.iam.createPolicy({
            PolicyName: policyInfo.PolicyName,
            Description: policyInfo.Description,
            Path: policyInfo.Path,
            PolicyDocument: decodeURIComponent(policyVersionInfo!.Document!)
          });
          await this._targetAccount.clients.iam.attachRolePolicy({
            RoleName: roleName,
            PolicyArn: targetPolicy!.Arn
          });
        }
      }
    }
  }

  private async _getInlinePoliciesToAddToTargetAccount(
    roleName: string
  ): Promise<Array<{ policyName: string; policyDocument: string }>> {
    const srcInlinePolicyNames = await this._getAllInlineRolePoliciesName(roleName, this._sourceAccount);
    const targetInlinePolicyNames = await this._getAllInlineRolePoliciesName(roleName, this._targetAccount);

    const policiesToAddToTargetAccount: Array<{ policyName: string; policyDocument: string }> = [];
    for (const srcPolicyName of srcInlinePolicyNames) {
      const policyParam: GetRolePolicyCommandInput = {
        PolicyName: srcPolicyName,
        RoleName: roleName
      };
      const sourcePolicyDocument = await this._sourceAccount.clients.iam.getRolePolicy(policyParam);
      // Add policies that are not in target role, but is in source role
      if (!targetInlinePolicyNames.includes(srcPolicyName)) {
        policiesToAddToTargetAccount.push({
          policyName: srcPolicyName,
          policyDocument: sourcePolicyDocument.PolicyDocument!
        });
      } else {
        const targetPolicyDocument = await this._targetAccount.clients.iam.getRolePolicy(policyParam);
        // Update policies that are in both account but target account policy is different from source account
        if (sourcePolicyDocument.PolicyDocument !== targetPolicyDocument.PolicyDocument) {
          policiesToAddToTargetAccount.push({
            policyName: srcPolicyName,
            policyDocument: sourcePolicyDocument.PolicyDocument!
          });
        }
      }
    }
    return policiesToAddToTargetAccount;
  }

  private async _getAllInlineRolePoliciesName(roleName: string, awsService: AwsService): Promise<string[]> {
    let allPoliciesName: string[] = [];
    let isTruncated = true;
    let marker = undefined;
    do {
      const response: ListRolePoliciesCommandOutput = await awsService.clients.iam.listRolePolicies({
        RoleName: roleName,
        Marker: marker
      });
      if (response.PolicyNames) {
        allPoliciesName = allPoliciesName.concat(response.PolicyNames);
      }
      isTruncated = response.IsTruncated ?? false;
      marker = response.Marker;
    } while (isTruncated);
    return allPoliciesName;
  }

  private async _getAllManagedRolePolicies(
    roleName: string,
    awsService: AwsService
  ): Promise<AttachedPolicy[]> {
    let allAttachedPolicies: AttachedPolicy[] = [];
    let isTruncated = true;
    let marker = undefined;
    do {
      const response: ListAttachedRolePoliciesCommandOutput =
        await awsService.clients.iam.listAttachedRolePolicies({
          RoleName: roleName,
          Marker: marker
        });
      if (response.AttachedPolicies) {
        allAttachedPolicies = allAttachedPolicies.concat(response.AttachedPolicies);
        isTruncated = response.IsTruncated ?? false;
        marker = response.Marker;
      } else {
        isTruncated = false;
      }
    } while (isTruncated);
    return allAttachedPolicies;
  }
}
