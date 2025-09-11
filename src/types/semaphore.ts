import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';

export type SemaphoreIdentityStorage = {
  privateKey: string;
  commitment: string;
  signature: string; // Store the signature used to generate the identity
};

export type SemaphoreGroupMember = {
  commitment: string;
  index: number;
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

// New allocation vote structure
export type AllocationVote = {
  farm: string; // address as string
  weight: string; // uint96 as string for big number handling
};

// Enhanced Semaphore proof structure to match contract
export type EnhancedSemaphoreProof = {
  merkleTreeDepth: string;
  merkleTreeRoot: string;
  nullifier: string;
  message: string;
  scope: string;
  points: string[]; // array of 8 elements
};

export type SubmitVoteRequest = {
  asset: string; // address of the asset these farms belong to
  groupId: string;
  unwindingEpochs: number;
  liquidVotes: AllocationVote[];
  illiquidVotes: AllocationVote[];
  proof: EnhancedSemaphoreProof;
  nullifier: string;
};

export type SubmitVoteResponse = {
  success: boolean;
  transactionHash?: string;
  error?: string;
  details?: string;
  originalError?: string;
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

// Asset types for allocation voting
export type VotingAsset = {
  id: string;
  name: string;
  address: string;
  description: string;
  type: 'liquid' | 'illiquid';
};

// User's allocation for voting
export type AllocationData = {
  liquidVotes: AllocationVote[];
  illiquidVotes: AllocationVote[];
};