export default class AccountHandler {
  /* eslint-disable-next-line */
  public async execute(event: any): Promise<void> {
    /*
     * Share SC portfolio with hosting accounts that doesn't already have SC portfolio from main account
     * Hosting account accept portfolio (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/accept-portfolio-share.html) that was shared
     * In hosting account, associate envManagement IAM role to SC portfolio (API (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/associate-principal-with-portfolio.html))(Example code (https://github.com/awslabs/service-workbench-on-aws/blob/5afa5a68ac8fdb4939864e52a5b13cfc0b227118/addons/addon-environment-sc-api/packages/environment-sc-workflow-steps/lib/steps/share-portfolio-with-target-acc/share-portfolio-with-target-acc.js#L84) from SWBv1)
     * Copy LaunchConstraint role to hosting accounts that doesn't already have the role
     * Share SSM documents with all hosting accounts that does not have the SSM document already
     * Share all AMIs in this https://quip-amazon.com/HOa9A1K99csF/Environment-Management-Design#temp:C:HDIfa98490bd9047f0d9bfd43ee0 with all hosting account
     * Check if all hosting accounts have updated onboard-account.cfn.yml template. If the hosting accounts does not, update hosting account status to be Needs Update
     * Add hosting account VPC and Subnet ID to DDB
     */
    console.log(`Account Handler executed with event ${JSON.stringify(event)}`);
  }
}
