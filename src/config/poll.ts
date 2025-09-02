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

// Helper function to get InitialVoiceCreditProxy address from poll's external contracts
export function getInitialVoiceCreditProxyAddress(): Address {
  return '0xcc71E493824Bbbc246F1339b98c6F326Fd29E937'
}

// MACI circuit configuration
export const MACI_STATE_TREE_DEPTH = 10;
export const MACI_TESTING_MODE = true;

export const HARDCODED_POLLS: Poll[] = [
  {
    id: '12',
    name: 'Test Poll #12',
    pollContract: '0x98Eb75caD2a41a0c90aa9038c8f4901c8044DF0D',
    messageProcessor: '0x5cdA78B0662443ECda5310d3834620c5414601D4',
    tally: '0xf4147cE9b794234c27Eec5736555d5d2fdDd90a5',
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