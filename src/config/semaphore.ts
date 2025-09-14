import { Address } from 'viem';
import { VotingAsset } from '@/types/semaphore';

export type VoteOption = {
  id: number;
  title: string;
  description?: string;
};

export type SemaphoreVotingState = {
  contractAddress: Address;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  voteOptions: VoteOption[]; // Keep for backwards compatibility
  title: string;
  description?: string;
  // New allocation voting properties
  assetAddress: Address;
  unwindingEpochs: number;
  liquidAssets: VotingAsset[];
  illiquidAssets: VotingAsset[];
};

export type SemaphoreConfig = {
  contractAddress: Address;
  votingContractAddress: Address;
  appSignatureMessage: string;
  testing: boolean;
  subgraphUrl: string;
};

export const SEMAPHORE_CONTRACT_ADDRESS: Address = '0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D';

// Voting contract address (deployed by user)
export const ALLOCATION_VOTING: Address = '0x7E6033a15d1587dd5F696022A30a1573771dB0cE';

// Unique signature message for this voting app (prevents identity reuse across apps)
export const APP_SIGNATURE_MESSAGE = "Sign this message to generate your anonymous identity for ZKnify. Only sign this on the official ZK Core website.";

// Testing configuration
export const SEMAPHORE_TESTING_MODE = true;

// Subgraph configuration
export const SEMAPHORE_SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/14377/semaphore-base-sepolia/v4.5.0'; // official
// export const SEMAPHORE_SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/94369/semaphore-base-sepolia/v0.0.1';

// USDC on baseSepolia
export const MOCK_ASSET_ADDRESS: Address = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Current voting state - updated for allocation voting
export const CURRENT_VOTING_STATE: SemaphoreVotingState = {
  contractAddress: ALLOCATION_VOTING,
  isActive: true,
  voteOptions: [
    // Keep for backwards compatibility during transition
    { id: 0, title: 'Liquid Assets', description: 'Allocate voting power to liquid farming strategies' },
    { id: 1, title: 'Illiquid Assets', description: 'Allocate voting power to illiquid farming strategies' }
  ],
  title: 'Farm Allocation Voting',
  description: 'Allocate your voting power across liquid and illiquid farming strategies using anonymous zero-knowledge proofs.',
  // New allocation voting properties
  assetAddress: MOCK_ASSET_ADDRESS,
  unwindingEpochs: 4, // Default unwinding epochs
  liquidAssets: [
    {
      id: 'liquid-farm-1',
      name: 'Morpho USDC/BTC',
      address: '0x8c9D1b9e39d080D92C1D003adC2Bf3f02E9a0307', // mock 1
      description: 'USDC Lending with BTC collateral',
      type: 'liquid'
    },
    {
      id: 'liquid-farm-2', 
      name: 'Euler USDC/ETH',
      address: '0xA9653f9a34C0fd8dC7588d1b9a370001Aa6C2F3B', // mock 2
      description: 'USDC Lending with WETH collateral',
      type: 'liquid'
    }
  ],
  illiquidAssets: [
    {
      id: 'illiquid-farm-1',
      name: 'Pendle PT USDC 2025-12-03',
      address: '0xc5A2278925a1EDc6ea6707AF6E1c9978450Ba8eB',
      description: 'Pendle USDC with principle token',
      type: 'illiquid'
    },
    {
      id: 'illiquid-farm-2',
      name: 'Pendle PT USDC 2025-12-28',
      address: '0x93B1b1D55B020d5a972654D9f9EcF7375260dC2d',
      description: 'Pendle USDC with principle token',
      type: 'illiquid'
    }
  ]
};

export function getSemaphoreConfig(): SemaphoreConfig {
  return {
    contractAddress: SEMAPHORE_CONTRACT_ADDRESS,
    votingContractAddress: ALLOCATION_VOTING,
    appSignatureMessage: APP_SIGNATURE_MESSAGE,
    testing: SEMAPHORE_TESTING_MODE,
    subgraphUrl: SEMAPHORE_SUBGRAPH_URL,
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