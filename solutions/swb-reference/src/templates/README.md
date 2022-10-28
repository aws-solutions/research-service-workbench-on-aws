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

### How to use these:
1. Launch the stack in a network account
1. Share the network account's transit gateway with the hosting account
    1.Go to `VPC` -> `Transit Gateways` -> `Transit Gateways`
    1. Select the transit gateway and, from the Actions menu, select "Share transit gateway" 
    1. If a resource share doesn't already exist for your TGW, then create one. Make sure to give access to the app account on the "Grant access to principals"
1. On the onboarding account, accept the resource share
    1. Resource Access Manager -> Shared with me -> Accept the invite
1. Launch the onboarding stack in the hosting account with the relevant outputs from the network account onboarding
