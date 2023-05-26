# Onboarding a hosting account template

Here are a few onboarding template choices that you could use for onboarding your hosting account. The difference between each of these templates is based on the level of network flexibility you need. This is where your SWB compute resources would be hosted.

----

## Onboard Account (Default)
This is the default [template](./onboard-account.cfn.yaml) for onboarding a hosting account. This CFN template creates all resources SWB needs to manage the relationship between the main and hosting accounts. The network components in this template are associated with an Internet Gateway, therefore workspaces in this account network will have access to internet.

----

## Onboard Account (Bring Your Own Network)
This [template](./onboard-account-byon.cfn.yaml) does everything the [default](#onboard-account-default) template does, except allows the user to bring their own network components (VPC and subnets). This template therefore gives the user more granular control by using pre-configured networks for hosting workspaces. These pre-configurations can include, but are not limited to, network traffic monitoring, cross account network control (using route tables, [VPC peering](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/peer-with-vpc-in-another-account.html), [PrivateLink](https://docs.aws.amazon.com/vpc/latest/userguide/endpoint-services-overview.html) etc.), and additional security layers.

----
## Integrating with a Central Network Account
The following CloudFormation templates help setting up hosting accounts while integrating them with a Central Network Account using Transit Gateway and Network Firewall.
## Firewall and TGW
A Central Network account can be used by customers who have specific network monitoring and regulatory requirements to be carried out with that account, allowing the user to manage main account and hosting account network traffic all at one place. 

This [template](./new-firewall-vpc.yaml) can be deployed in such a central network account for that purpose. This uses a network firewall AMI and creates a Security VPC, Gateway Load Balancer with firewall instance targets, and a Transit Gateway. The Security VPC can be used for monitoring network traffic centrally between the main and hosting accounts.

This template was originally designed for use with Palo Alto Networks' VM Series firewall offering on AWS Marketplace. However, the template can be modified to leverage any firewall offering on AWS Marektplace that has an AMI.

## Onboard Account TGW
This [template](./onboard-account-tgw.cfn.yaml) onboards a hosting account as well as helps integrate with the resources created as part of the [Firewall and TGW](#firewall-and-tgw) template deployed in the Central Network account. You need to provide the Gateway Load Balancer Service ID and Transit Gateway ID output values from the Central Network account to this template's input parameters. This template provisions public/private network components (VPC and Subnets).

### Dependencies
As is, these templates depend on a subscription to an EC2 firewall appliance. We recommend you or your SA review the network settings in both the `new-firewall-vpc.yaml` file and the `onboard-account-tgw.cfn.yaml` to update them to best suit your needs.

### How to use these:
1. Launch the stack in a central network account
1. Share the network account's transit gateway with the hosting account
    1. Go to `VPC` -> `Transit Gateways` -> `Transit Gateways`
    1. Select the transit gateway and, from the Actions menu, select "Share transit gateway" 
    1. If a resource share doesn't already exist for your TGW, then create one. Make sure to give access to the hosting account on the "Grant access to principals"
1. On the hosting account, accept the resource share
    1. Resource Access Manager -> Shared with me -> Accept the invite
1. Launch the onboarding stack (`onboard-account-tgw.cfn.yaml`) in the hosting account with the relevant outputs from the central network account stack.
1. Since this stack creates its own network components, associate its subnets to Transit Gateway by adding them to the SecurityVPC route table. This helps centrally inspect egress traffic inspection.
1. If you are using public hosting account subnets, create Gateway Load Balancer endpoints in the hosting account. Each endpoint needs a subnet per Availability Zone. The Internet Gateway route table needs to have these endpoints added for ingress traffic inspection.
1. Use the outputs from the onboarding stack to onboard the account with the main account per the instructions in the [setup instructions](../../README.md#setup-instructions-for-rsw).

Egress Network Flow:
- Subnet (Hosting Acc) -> Security VPC Route Table (Central N/W Acc) -> TGW and Firewall (Central N/W Acc) -> NAT Gateway (Central N/W Acc) -> Internet / Main Acc

Ingress Network Flow:
- Main Acc -> Security VPC Route Table (Central N/W Acc) -> TGW and Firewall (Central N/W Acc) -> Subnet (Hosting Acc)
