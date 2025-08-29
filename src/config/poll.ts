import { Address } from 'viem';

export type VoteOption = {
  id: number;
  title: string;
  description?: string;
};

export type Poll = {
  id: string;
  name?: string;
  pollContract: Address;
  messageProcessor: Address;
  tally: Address;
  voteOptions?: VoteOption[];
};

export type MaciConfig = {
  address: Address;
  polls: Poll[];
  stateTreeDepth: number;
  testing: boolean;
};

// Global MACI configuration - assuming single MACI contract for now
export const MACI_CONTRACT_ADDRESS: Address = '0x9c8576DF269DAa79497473A763eB2736091652A0';

// MACI circuit configuration
export const MACI_STATE_TREE_DEPTH = 10;
export const MACI_TESTING_MODE = true;

export const HARDCODED_POLLS: Poll[] = [
  {
    id: '9',
    name: 'Test Poll #9',
    pollContract: '0x7661b769E18645d1F99c5D43D18b2c26D23a00C2',
    messageProcessor: '0xCdF77b77F06cf9125415d229e775380A925bc365',
    tally: '0xc97060907345D57e698c64Ec2a9F723Cc5a250CC',
    voteOptions: [
      { id: 0, title: 'Yes', description: 'Vote in favor of the proposal' },
      { id: 1, title: 'No', description: 'Vote against the proposal' },
      { id: 2, title: 'Abstain', description: 'Neutral vote' }
    ],
  },
];

export function getPollById(id: string): Poll | undefined {
  return HARDCODED_POLLS.find(poll => poll.id === id);
}

export function getPollByAddress(address: Address): Poll | undefined {
  return HARDCODED_POLLS.find(poll => 
    poll.pollContract.toLowerCase() === address.toLowerCase()
  );
}

export function getMaciAddress(): Address {
  return MACI_CONTRACT_ADDRESS;
}

export function getMaciConfig(): { stateTreeDepth: number; testing: boolean } {
  return {
    stateTreeDepth: MACI_STATE_TREE_DEPTH,
    testing: MACI_TESTING_MODE,
  };
}