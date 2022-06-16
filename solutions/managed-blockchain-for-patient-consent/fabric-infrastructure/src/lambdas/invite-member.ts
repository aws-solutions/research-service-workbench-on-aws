/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CdkCustomResourceEvent } from 'aws-lambda';
import {
  ManagedBlockchainClient,
  CreateProposalCommand,
  VoteOnProposalCommand
} from '@aws-sdk/client-managedblockchain';
const {
  MEMBER_ID: memberId,
  NETWORK_ID: networkId,
  MEMBERS_TO_INVITE: membersToInvite
} = process.env as {
  MEMBER_ID: string;
  NETWORK_ID: string;
  MEMBERS_TO_INVITE: string;
};

export const inviteMemberHandler = async (event: CdkCustomResourceEvent): Promise<void> => {
  if (event.RequestType === 'Create') {
    for (const accountId of membersToInvite.split(',')) {
      try {
        const proposalParams = {
          Actions: {
            Invitations: [
              {
                Principal: accountId
              }
            ]
          },
          MemberId: memberId,
          NetworkId: networkId,
          Description: 'Invite new member ',
          Tags: {
            'new-member': accountId
          }
        };

        const client = new ManagedBlockchainClient({});
        const proposalCommand = new CreateProposalCommand(proposalParams);
        const proposalResponse = await client.send(proposalCommand);

        const voteParams = {
          VoterMemberId: memberId,
          NetworkId: networkId,
          Vote: 'YES',
          ProposalId: proposalResponse.ProposalId
        };

        const command = new VoteOnProposalCommand(voteParams);
        const response = await client.send(command);
        console.log(response);
      } catch (error) {
        console.error(`Failed to invite account ${accountId}, encountered error ${error}`);
      }
    }
  }
};
