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
  groupId: bigint;
  appSignatureMessage: string;
  testing: boolean;
};

export const SEMAPHORE_CONTRACT_ADDRESS: Address = '0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D';

// Group ID for the voting group  
export const VOTING_GROUP_ID = BigInt(1);

// Unique signature message for this voting app (prevents identity reuse across apps)
export const APP_SIGNATURE_MESSAGE = "Sign this message to generate your anonymous identity for ZKnify. Only sign this on the official ZK Core website.";

// Testing configuration
export const SEMAPHORE_TESTING_MODE = true;

// Current voting state - this replaces the hardcoded polls array
export const CURRENT_VOTING_STATE: SemaphoreVotingState = {
  groupId: VOTING_GROUP_ID,
  contractAddress: SEMAPHORE_CONTRACT_ADDRESS,
  isActive: true,
  voteOptions: [
    { id: 0, title: 'Yes', description: 'Vote in favor of the proposal' },
    { id: 1, title: 'No', description: 'Vote against the proposal' },
    { id: 2, title: 'Abstain', description: 'Neutral vote' }
  ],
  totalMembers: 0, // Will be fetched dynamically
  title: 'ZK Core Governance Proposal',
  description: 'Vote on the latest governance proposal using anonymous zero-knowledge proofs.'
};

export function getSemaphoreConfig(): SemaphoreConfig {
  return {
    contractAddress: SEMAPHORE_CONTRACT_ADDRESS,
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
  joinGroup: '/api/semaphore/join',
  submitVote: '/api/semaphore/vote',
  getGroupMembers: '/api/semaphore/group-members',
  getVoteResults: '/api/semaphore/results',
} as const;