import { Address } from 'viem';

export type PollContracts = {
  pollContract: Address;
  messageProcessor: Address;
  tally: Address;
  maci: Address;
};

export type VoteOption = {
  id: number;
  title: string;
  description?: string;
};

export type PollConfig = PollContracts & {
  id: string;
  name?: string;
  voteOptions?: VoteOption[];
}

export const HARDCODED_POLLS: PollConfig[] = [
  {
    id: '5',
    name: 'Test Poll #5',
    pollContract: '0xca2Ce74874Ce5240F400D51d03EBa35FEB102168',
    messageProcessor: '0x5ee73c83399Efc2576D16bc84b1a91bEd6bc4d21',
    tally: '0x10E4FCec989FBfDbffeC8545F543620e840d75c1',
    maci: '0x9c8576DF269DAa79497473A763eB2736091652A0',
    voteOptions: [
      { id: 0, title: 'Yes', description: 'Vote in favor of the proposal' },
      { id: 1, title: 'No', description: 'Vote against the proposal' },
      { id: 2, title: 'Abstain', description: 'Neutral vote' }
    ],
  },
];

export function getPollById(id: string): PollConfig | undefined {
  return HARDCODED_POLLS.find(poll => poll.id === id);
}

export function getPollByAddress(address: Address): PollConfig | undefined {
  return HARDCODED_POLLS.find(poll => 
    poll.pollContract.toLowerCase() === address.toLowerCase()
  );
}