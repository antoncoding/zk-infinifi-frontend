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
    id: '8',
    name: 'Test Poll #8',
    pollContract: '0x6df46fe382f1Cd902B30C7C0bBE63369cE0b4DCD',
    messageProcessor: '0x11014f2A70D44b21Be40CEfFCE7fC9DB91140981',
    tally: '0xC684256D8b1892DB58aEF04f89cAe0fA1459FB43',
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