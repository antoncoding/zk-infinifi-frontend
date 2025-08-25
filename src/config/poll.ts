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
    pollContract: '0x437cDCd909561598966EEca21Cc12F22096a78d1',
    messageProcessor: '0x2B24b811B8d59625b8e93Fd780050dA04B6b9DE1',
    tally: '0x5855aC0097F0ED54Aa0E93171A558064024E4FA9',
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