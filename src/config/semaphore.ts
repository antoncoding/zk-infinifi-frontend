import { Address } from 'viem';

export type VoteOption = {
  id: number;
  title: string;
  description?: string;
};

export type SemaphoreVotingState = {
  groupId: bigint;
  contractAddress: Address;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  voteOptions: VoteOption[];
  totalMembers: number;
  title: string;
  description?: string;
};

export type SemaphoreConfig = {
  contractAddress: Address;
  votingContractAddress: Address;
  groupId: bigint;
  appSignatureMessage: string;
  testing: boolean;
};

export const SEMAPHORE_CONTRACT_ADDRESS: Address = '0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D';

// Voting contract address (deployed by user)
export const VOTING_CONTRACT_ADDRESS: Address = '0x56Df8ED12857eAB87eE6e6f8D9E03A6F734e68Bb';

// Group ID for the voting group  
export const VOTING_GROUP_ID = BigInt(1);

// Unique signature message for this voting app (prevents identity reuse across apps)
export const APP_SIGNATURE_MESSAGE = "Sign this message to generate your anonymous identity for ZKnify. Only sign this on the official ZK Core website.";

// Testing configuration
export const SEMAPHORE_TESTING_MODE = true;

// Current voting state - this replaces the hardcoded polls array
export const CURRENT_VOTING_STATE: SemaphoreVotingState = {
  groupId: VOTING_GROUP_ID,
  contractAddress: VOTING_CONTRACT_ADDRESS,
  isActive: true,
  voteOptions: [
    { id: 0, title: 'Option A', description: 'Allocate 50% to Development' },
    { id: 1, title: 'Option B', description: 'Allocate 30% to Marketing' },
    { id: 2, title: 'Option C', description: 'Allocate 20% to Operations' }
  ],
  totalMembers: 0, // Will be fetched dynamically
  title: 'Allocation Voting - Resource Distribution',
  description: 'Vote on how to distribute resources across different categories using anonymous zero-knowledge proofs.'
};

export function getSemaphoreConfig(): SemaphoreConfig {
  return {
    contractAddress: SEMAPHORE_CONTRACT_ADDRESS,
    votingContractAddress: VOTING_CONTRACT_ADDRESS,
    groupId: VOTING_GROUP_ID,
    appSignatureMessage: APP_SIGNATURE_MESSAGE,
    testing: SEMAPHORE_TESTING_MODE,
  };
}

export function getCurrentVotingState(): SemaphoreVotingState {
  return CURRENT_VOTING_STATE;
}

// Backend API endpoints for Semaphore operations
export const API_ENDPOINTS = {
  joinGroup: '/api/join-poll',
  submitVote: '/api/semaphore/vote',
  getGroupMembers: '/api/semaphore/group-members',
  getVoteResults: '/api/semaphore/results',
} as const;