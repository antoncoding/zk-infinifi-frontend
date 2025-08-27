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
};

// Global MACI configuration - assuming single MACI contract for now
export const MACI_CONTRACT_ADDRESS: Address = '0x9c8576DF269DAa79497473A763eB2736091652A0';

export const HARDCODED_POLLS: Poll[] = [
  {
    id: '5',
    name: 'Test Poll #5',
    pollContract: '0x7d926F09eC950ab13ac879A350eDA6a8f45201a3',
    messageProcessor: '0xF60E54B839C044635C701D74D7Be0Dd62AEEf65B',
    tally: '0x0B736A2C3F834C8E0819E4d2a16349AFa6F6BBcD',
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