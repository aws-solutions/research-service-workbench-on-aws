# Onboarding a hosting account template

Here are a few onboarding template choices that you could use for onboarding your hosting account. The difference between each of these templates is based on the level of network flexibility you need. This is where your SWB compute resources would be hosted.

----

## Onboard Account (Default)
This is the default [template](./onboard-account.cfn.yaml) for onboarding a hosting account. This CFN template creates all resources SWB needs to manage the relationship between the main and hosting accounts. The network components in this template are associated with an Internet Gateway, therefore workspaces in this account network will have access to internet.

----

## Onboard Account (Bring Your Own Network)
This [template](./onboard-account-byon.cfn.yaml) does everything the [default](#onboard-account-default) template does, except allows the user to bring their own network components (VPC and subnets). This template therefore gives the user more granular control by using pre-configured networks for hosting workspaces. These pre-configurations can include, but are not limited to, network traffic monitoring, cross account network control (using route tables, [VPC peering](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/peer-with-vpc-in-another-account.html), [PrivateLink](https://docs.aws.amazon.com/vpc/latest/userguide/endpoint-services-overview.html) etc.), and additional security layers.
