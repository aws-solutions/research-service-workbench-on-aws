import {
  ManagedBlockchainClient,
  CreateProposalCommand,
  VoteOnProposalCommand
} from '@aws-sdk/client-managedblockchain';
import { mockClient } from 'aws-sdk-client-mock';
import { inviteMemberHandler } from '../lambdas/invite-member';

describe('inviteMemberHandler', () => {
  const ORIGINAL_ENV = process.env;
  let mockCreateProposal: jest.Mock;
  let mockVoteProposal: jest.Mock;
  beforeAll(() => {
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.MEMBER_ID = 'm-somefakememberid';
    process.env.NETWORK_ID = 'n-somefakenetworkid';
    process.env.MEMBERS_TO_INVITE = '1234567890, 0987654321';
  });

  beforeEach(() => {
    mockCreateProposal = jest.fn().mockResolvedValue({ ProposalId: 'p-1234567' });
    mockVoteProposal = jest.fn().mockResolvedValue({});

    const mockBlockchainClient = mockClient(ManagedBlockchainClient);
    mockBlockchainClient.on(CreateProposalCommand).callsFake(mockCreateProposal);
    mockBlockchainClient.on(VoteOnProposalCommand).callsFake(mockVoteProposal);
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });
  test('Invite 2 members on RequestType Create', async () => {
    await inviteMemberHandler({
      LogicalResourceId: '',
      RequestId: '',
      RequestType: 'Create',
      ResourceProperties: { ServiceToken: '' },
      ResourceType: '',
      ResponseURL: '',
      ServiceToken: '',
      StackId: ''
    });

    expect(mockCreateProposal).toMatchSnapshot();
    expect(mockVoteProposal).toMatchSnapshot();
  });

  test('Do nothing on RequestType Update', async () => {
    await inviteMemberHandler({
      LogicalResourceId: '',
      OldResourceProperties: {},
      PhysicalResourceId: '',
      RequestId: '',
      RequestType: 'Update',
      ResourceProperties: { ServiceToken: '' },
      ResourceType: '',
      ResponseURL: '',
      ServiceToken: '',
      StackId: ''
    });

    expect(mockCreateProposal).not.toHaveBeenCalled();
    expect(mockVoteProposal).not.toHaveBeenCalled();
  });
});
