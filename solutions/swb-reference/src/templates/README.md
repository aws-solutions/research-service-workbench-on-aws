# As we enable more hosting account templates, we will document the purpose of each here

## onboard-account.cfn.yaml
A CFN template that creates all resources SWB needs to manage the relationship between the main and hosting accounts.

## onboard-account-byon.cfn.yaml
A CFN template that does everything onboard-account.cfn.yaml does, except allows the hosting account to use its own VPCs.

## The following are CFN templates that help setting up networks for transit gate ways in the BYON scenario
### new-firewall-vpc-TGW.yaml
A template to help a Network account set up VPCs, a firewall, and a Transit Gateway. 

This template was originally designed for use with Palo Alto Networks' VM Series firewall offering on AWS Marketplace. However, the template can be modified to leverage any firewall offering on AWS Marektplace that has an AMI.


### app-vpc-new.yaml
A template to help hosting/member accounts integrate with the Network account. The resources created by this will be inputs into the onboard-account-byon.cfn.yaml
