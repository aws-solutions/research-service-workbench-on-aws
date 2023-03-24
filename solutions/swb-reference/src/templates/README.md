# As we enable more hosting account templates, we will document the purpose of each here

## onboard-account.cfn.yaml
A CFN template that creates all resources SWB needs to manage the relationship between the main and hosting accounts.

## onboard-account-byon.cfn.yaml
A CFN template that does everything onboard-account.cfn.yaml does, except allows the hosting account to use its own VPCs.

## The following are CFN templates that help setting up networks for transit gate ways in the BYON scenario
### new-firewall-vpc-TGW.yaml
A template to help a Network account set up VPCs, a firewall, and a Transit Gateway. 

This template was originally designed for use with Palo Alto Networks' VM Series firewall offering on AWS Marketplace. However, the template can be modified to leverage any firewall offering on AWS Marektplace that has an AMI.

### onboard-account-tgw.cfn.yaml
A template to help hosting/member accounts integrate with the Network account. 

### Dependencies
As is, these templates depend on a subscription to an EC2 firewall appliance. We recommend you or your SA review the network settings in both the `new-firewall-vpc.yaml` file and the `onboard-account-tgw.cfn.yaml` to update them to best suit your needs. This may include removing the EC2 firewall and the Gatewayload balancer, and updating the Transit Gateway's and onboarding account's route tables to reroute trafic that used to go through the EC2 firewall.

### How to use these:
1. Launch the stack in a network account
1. Share the network account's transit gateway with the hosting account
    1.Go to `VPC` -> `Transit Gateways` -> `Transit Gateways`
    1. Select the transit gateway and, from the Actions menu, select "Share transit gateway" 
    1. If a resource share doesn't already exist for your TGW, then create one. Make sure to give access to the app account on the "Grant access to principals"
1. On the onboarding account, accept the resource share
    1. Resource Access Manager -> Shared with me -> Accept the invite
1. Launch the onboarding stack (`onboard-account-tgw.cfn.yaml`) in the hosting account with the relevant outputs from the network account onboarding
1. Use the outputs from the onboarding stack to onboard the account with the main account per the instructions in the [setup instructions](../../README.md#setup-instructions-for-swbv2p1).
