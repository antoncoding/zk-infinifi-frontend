import { Address } from 'viem';

export type PollContracts = {
  pollContract: Address;
  messageProcessor: Address;
  tally: Address;
};

export type PollConfig = PollContracts & {
  id: string;
  name?: string;
}

export const HARDCODED_POLLS: PollConfig[] = [
  {
    id: '1',
    name: 'Test Poll #1',
    pollContract: '0xca2Ce74874Ce5240F400D51d03EBa35FEB102168',
    messageProcessor: '0x5ee73c83399Efc2576D16bc84b1a91bEd6bc4d21',
    tally: '0x10E4FCec989FBfDbffeC8545F543620e840d75c1',
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