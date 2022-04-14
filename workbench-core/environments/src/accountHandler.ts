import { AwsService } from '@amzn/workbench-core-base';
import {
  AttachedPolicy,
  GetRolePolicyCommandInput,
  IAMServiceException,
  ListAttachedRolePoliciesCommandOutput,
  ListRolePoliciesCommandOutput,
  Role
} from '@aws-sdk/client-iam';
export default class AccountHandler {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  // TODO: Consider moving these methods to `hostingAccountLifecycleService`
  // TODO: Take a look at this https://quip-amazon.com/5SbZAHDcaw0m/Account-Class-Architecture
  /* eslint-disable-next-line */
  public async execute(event: any): Promise<void> {
    /*
     * [Done] Share SC portfolio with hosting accounts that doesn't already have SC portfolio from main account
     * [Done] Hosting account accept portfolio (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/accept-portfolio-share.html) that was shared
     * [Done] In hosting account, associate envManagement IAM role to SC portfolio (API (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/associate-principal-with-portfolio.html))(Example code (https://github.com/awslabs/service-workbench-on-aws/blob/5afa5a68ac8fdb4939864e52a5b13cfc0b227118/addons/addon-environment-sc-api/packages/environment-sc-workflow-steps/lib/steps/share-portfolio-with-target-acc/share-portfolio-with-target-acc.js#L84) from SWBv1)
     * Copy LaunchConstraint role to hosting accounts that doesn't already have the role
     * (Already in `hostingAccountLifecycleService`) Share SSM documents with all hosting accounts that does not have the SSM document already
     * (Already in `hostingAccountLifecycleService`) Share all AMIs in this https://quip-amazon.com/HOa9A1K99csF/Environment-Management-Design#temp:C:HDIfa98490bd9047f0d9bfd43ee0 with all hosting account
     * Check if all hosting accounts have updated onboard-account.cfn.yml template. If the hosting accounts does not, update hosting account status to be Needs Update
     * Add hosting account VPC and Subnet ID to DDB
     */

    // eslint-disable-next-line
    const { hostingAccountArns, externalId, portfolioId, hostingAccountId } = await this._getMetadataFromDB();
    for (const hostingAccountArn of hostingAccountArns) {
      const hostingAccountAwsService = await this._mainAccountAwsService.getAwsServiceForRole({
        roleArn: hostingAccountArn.accountHandler,
        roleSessionName: 'account-handler',
        externalId: externalId as string,
        region: process.env.AWS_REGION!
      });
      // await this._shareAndAcceptScPortfolio(
      //   hostingAccountAwsService,
      //   hostingAccountId as string,
      //   portfolioId as string
      // );
      // await this._associateIamRoleWithPortfolio(
      //   hostingAccountAwsService,
      //   hostingAccountArn.envManagement,
      //   portfolioId as string
      // );
      // TODO: Get LC from CFN Stack
      const launchConstraintRoleName = 'swb-dev-oh-LaunchConstraint';
      await this._copyLaunchConstraintRole(launchConstraintRoleName, hostingAccountAwsService);
    }
  }

  //eslint-disable-next-line
  private async _copyLaunchConstraintRole(
    launchConstraintRoleName: string,
    hostingAccountAwsService: AwsService
  ) {
    console.log('Copying LC');
    const { Role: sourceRole } = await this._mainAccountAwsService.iam.getRole({
      RoleName: launchConstraintRoleName
    });

    let targetRole: Role;
    try {
      const response = await hostingAccountAwsService.iam.getRole({
        RoleName: launchConstraintRoleName
      });
      targetRole = response.Role!;
    } catch (e) {
      if (e instanceof IAMServiceException && e.name === 'NoSuchEntity') {
        console.log('Creating target role because target role does not exist in hosting account');
        if (sourceRole) {
          const response = await hostingAccountAwsService.iam.createRole({
            RoleName: launchConstraintRoleName,
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
      await hostingAccountAwsService.iam.updateAssumeRolePolicy({
        RoleName: launchConstraintRoleName,
        PolicyDocument: sourceRole!.AssumeRolePolicyDocument
      });
    }

    console.log('Copied LC');

    const inlinePoliciesToAddToTargetAccount = await this._getInlinePoliciesToAddToTargetAccount(
      launchConstraintRoleName,
      hostingAccountAwsService
    );
    console.log(
      `Adding Inline Policies ${inlinePoliciesToAddToTargetAccount.map((policy) => {
        return policy.policyName;
      })}`
    );
    for (const policyToAdd of inlinePoliciesToAddToTargetAccount) {
      await hostingAccountAwsService.iam.putRolePolicy({
        RoleName: launchConstraintRoleName,
        PolicyName: policyToAdd.policyName,
        PolicyDocument: decodeURIComponent(policyToAdd.policyDocument)
      });
    }
    console.log('Copied inline policies');

    // TODO: Handle customer created managed policies
    const srcManagedPolicies = await this._getAllManagedRolePolicies(
      launchConstraintRoleName,
      this._mainAccountAwsService
    );
    const targetManagedPolicies = await this._getAllManagedRolePolicies(
      launchConstraintRoleName,
      hostingAccountAwsService
    );

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
      for (const policy of managedPoliciesNotInTargetAccount || []) {
        await hostingAccountAwsService.iam.attachRolePolicy({
          RoleName: launchConstraintRoleName,
          PolicyArn: policy.PolicyArn
        });
      }
    }

    console.log('Copied Managed Policies');
  }

  private async _getAllManagedRolePolicies(
    launchConstraintRoleName: string,
    awsService: AwsService
  ): Promise<AttachedPolicy[]> {
    let allAttachedPolicies: AttachedPolicy[] = [];
    let isTruncated = true;
    let marker = undefined;
    do {
      const response: ListAttachedRolePoliciesCommandOutput = await awsService.iam.listAttachedRolePolicies({
        RoleName: launchConstraintRoleName,
        Marker: marker
      });
      if (response.AttachedPolicies) {
        allAttachedPolicies = allAttachedPolicies.concat(response.AttachedPolicies);
        isTruncated = response.IsTruncated ?? false;
        marker = response.Marker;
      }
    } while (isTruncated);
    return allAttachedPolicies;
  }

  private async _getAllInlineRolePoliciesName(launchConstraintRoleName: string, awsService: AwsService) {
    let allPoliciesName: string[] = [];
    let isTruncated = true;
    let marker = undefined;
    do {
      const response: ListRolePoliciesCommandOutput = await awsService.iam.listRolePolicies({
        RoleName: launchConstraintRoleName,
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

  private async _getInlinePoliciesToAddToTargetAccount(
    launchConstraintRoleName: string,
    hostingAccountAwsService: AwsService
  ): Promise<Array<{ policyName: string; policyDocument: string }>> {
    // TODO: Loop through to get all inline policies
    const srcInlinePolicyNames = await this._getAllInlineRolePoliciesName(
      launchConstraintRoleName,
      this._mainAccountAwsService
    );
    const targetInlinePolicyNames = await this._getAllInlineRolePoliciesName(
      launchConstraintRoleName,
      hostingAccountAwsService
    );
    const inlinePoliciesToAdd: Array<{ policyName: string; policyDocument: string }> = [];
    if (srcInlinePolicyNames) {
      for (const policyName of srcInlinePolicyNames) {
        const policyParam: GetRolePolicyCommandInput = {
          PolicyName: policyName,
          RoleName: launchConstraintRoleName
        };
        const sourcePolicyDocument = await this._mainAccountAwsService.iam.getRolePolicy(policyParam);
        if (targetInlinePolicyNames && !targetInlinePolicyNames.includes(policyName)) {
          inlinePoliciesToAdd.push({
            policyName: policyName,
            policyDocument: sourcePolicyDocument.PolicyDocument!
          });
        } else {
          const targetPolicyDocument = await hostingAccountAwsService.iam.getRolePolicy(policyParam);
          if (sourcePolicyDocument.PolicyDocument !== targetPolicyDocument.PolicyDocument) {
            inlinePoliciesToAdd.push({
              policyName: policyName,
              policyDocument: sourcePolicyDocument.PolicyDocument!
            });
          }
        }
      }
    }
    return inlinePoliciesToAdd;
  }

  private async _associateIamRoleWithPortfolio(
    hostingAccountAwsService: AwsService,
    iamRole: string,
    portfolioId: string
  ): Promise<void> {
    console.log(`Associating ${iamRole} with porfolio ${portfolioId}`);
    await hostingAccountAwsService.serviceCatalog.associatePrincipalWithPortfolio({
      PortfolioId: portfolioId,
      PrincipalARN: iamRole,
      PrincipalType: 'IAM'
    });
  }

  // eslint-disable-next-line
  private async _getMetadataFromDB(): Promise<{ [key: string]: any }> {
    // TODO: Get this data from DDB
    return Promise.resolve({
      externalId: 'workbench',
      hostingAccountArns: [
        {
          accountHandler: 'arn:aws:iam::750404249455:role/swb-dev-oh-cross-account-role',
          envManagement: 'arn:aws:iam::750404249455:role/swb-dev-oh-xacc-env-mgmt'
        }
      ],
      portfolioId: 'port-4n4g66unobu34',
      hostingAccountId: '750404249455' // TODO: This value van be obtained from the hostingAccountIamRolArn
    });
  }

  private async _shareAndAcceptScPortfolio(
    hostingAccountAwsService: AwsService,
    hostingAccountId: string,
    portfolioId: string
  ): Promise<void> {
    console.log(`Sharing Service Catalog Portfolio ${portfolioId} with account ${hostingAccountId} `);
    await this._mainAccountAwsService.serviceCatalog.createPortfolioShare({
      PortfolioId: portfolioId,
      AccountId: hostingAccountId
    });

    await hostingAccountAwsService.serviceCatalog.acceptPortfolioShare({ PortfolioId: portfolioId });
  }
}
