import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';

export type SemaphoreIdentityStorage = {
  privateKey: string;
  commitment: string;
};

export type SemaphoreGroupMember = {
  commitment: string;
  index: number;
};

export type SemaphoreProofData = {
  merkleTreeDepth: number;
  merkleTreeRoot: bigint;
  nullifier: bigint;
  message: bigint;
  scope: bigint;
  points: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
};

export type VotingProofRequest = {
  groupId: bigint;
  vote: number;
  identity: Identity;
  group: Group;
};

export type JoinGroupRequest = {
  walletAddress: string;
  signature: string;
  identityCommitment: string;
};

export type JoinGroupResponse = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};

export type SubmitVoteRequest = {
  vote: number;
  proof: SemaphoreProofData;
  nullifier: string;
};

export type SubmitVoteResponse = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};

export type GroupMembersResponse = {
  members: SemaphoreGroupMember[];
  totalMembers: number;
  merkleRoot: string;
};

export type VoteResultsResponse = {
  results: Record<string, number>; // option id -> vote count
  totalVotes: number;
  nullifiers: string[]; // to track which votes have been cast
};

export type SemaphoreUserState = {
  hasIdentity: boolean;
  isGroupMember: boolean;
  hasVoted: boolean;
  identity?: Identity;
  commitment?: string;
};

export type IdentityGenerationError = {
  type: 'WALLET_NOT_CONNECTED' | 'SIGNATURE_REJECTED' | 'IDENTITY_GENERATION_FAILED';
  message: string;
};

export type GroupJoinError = {
  type: 'IDENTITY_REQUIRED' | 'ALREADY_MEMBER' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
};

export type VotingError = {
  type: 'NOT_GROUP_MEMBER' | 'ALREADY_VOTED' | 'PROOF_GENERATION_FAILED' | 'SUBMISSION_FAILED';
  message: string;
};