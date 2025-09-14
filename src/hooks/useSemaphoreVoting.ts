import { useCallback, useState, useEffect } from 'react';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof, verifyProof } from '@semaphore-protocol/proof';
import { ALLOCATION_VOTING, API_ENDPOINTS } from '@/config/semaphore';
import { 
  SubmitVoteRequest,
  SubmitVoteResponse,
  VoteResultsResponse,
  VotingError,
  AllocationData,
  EnhancedSemaphoreProof,
} from '@/types/semaphore';
import { getCurrentVotingState } from '@/config/semaphore';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast } from '@/utils/errorHandling';

import { SemaphoreProof } from '@semaphore-protocol/proof';
import { getEpochNow } from '@/lib/utils';
import { usePublicClient } from 'wagmi';
import { SupportedNetworks } from '@/utils/networks';
import { abi } from '@/abis/voting';

type SemaphoreVotingHookResult = {
  hasVoted: boolean;
  voteResults: Record<string, number>;
  totalVotes: number;
  submitAllocation: (allocationData: AllocationData, identity: Identity, group: Group) => Promise<{ success: boolean; transactionHash?: string }>;
  refreshResults: () => Promise<void>;
  isVoting: boolean;
  loading: boolean;
  error: VotingError | null;
};

/**
 * Hook to manage Semaphore voting operations
 * Handles vote submission, proof generation, and results fetching
 */
export function useSemaphoreVoting(userIdentity?: Identity, groupId?: bigint): SemaphoreVotingHookResult {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteResults, setVoteResults] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<VotingError | null>(null);

  const publicClient = usePublicClient({chainId: SupportedNetworks.BaseSepolia})


  // Fetch voting results and check if user has voted
  const fetchVoteResults = useCallback(async (): Promise<VoteResultsResponse> => {
    // Skip results fetching if no groupId is provided
    if (!groupId) {
      console.warn('No groupId provided - returning empty results');
      return { results: {}, totalVotes: 0, nullifiers: [] };
    }

    // Skip results fetching for now since endpoint doesn't exist
    console.warn('Results API disabled - returning empty results');
    return { results: {}, totalVotes: 0, nullifiers: [] };
  }, [groupId]);

  // Check if user has already voted by checking nullifiers
  const checkUserVotingStatus = useCallback((nullifiers: string[], userCommitment?: string): boolean => {
    if (!userCommitment || !userIdentity) return false;
    
    try {
      return false; // TODO: Let the contract revert!
    } catch (err) {
      console.error('Error checking voting status:', err);
      return false;
    }
  }, [userIdentity]);

  // Refresh voting results
  const refreshResults = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const results = await fetchVoteResults();
      
      setVoteResults(results.results);
      setTotalVotes(results.totalVotes);

      // Check if current user has voted
      if (userIdentity) {
        const hasUserVoted = checkUserVotingStatus(results.nullifiers, userIdentity.commitment.toString());
        setHasVoted(hasUserVoted);
      }
    } catch (err) {
      // Don't set error for development mode when API is not available
      if (!(err instanceof TypeError && (err as Error).message?.includes('fetch'))) {
        setError({
          type: 'SUBMISSION_FAILED',
          message: err instanceof Error ? err.message : 'Failed to fetch vote results'
        });
      }
      console.error('Error fetching vote results:', err);
      
      // Set empty results as fallback
      setVoteResults({});
      setTotalVotes(0);
      setHasVoted(false);
    } finally {
      setLoading(false);
    }
  }, [loading, fetchVoteResults, checkUserVotingStatus, userIdentity]);

  // Helper to create a hash from allocation data for the message
  const getHashFromALlocation = useCallback(async(allocationData: AllocationData): Promise<bigint> => {
      if (!publicClient) return BigInt(0)

      const message = await publicClient.readContract({
        address: ALLOCATION_VOTING,
        abi: abi,
        functionName: 'hashVotes',
        args: [
          allocationData.liquidVotes,
          allocationData.illiquidVotes
        ]
      })

      console.log("Responding message (hash)", message);

      return BigInt(message as bigint)
  }, [publicClient]);

  // Generate voting proof for allocation voting
  const generateAllocationProof = useCallback(async (
    allocationData: AllocationData, 
    identity: Identity, 
    group: Group
  ): Promise<SemaphoreProof | null> => {
    if (!groupId) {
      throw new Error('No groupId provided for proof generation');
    }

    try {
      // Create the message hash from allocation data
      const message = await getHashFromALlocation(allocationData);
      
      // Scope is the epoch
      const scope = getEpochNow();

      return await generateProof(identity, group, message, scope);
    } catch (err) {
      console.error('Error generating allocation proof:', err);
      throw new Error('Failed to generate allocation proof');
    }
  }, [groupId, getHashFromALlocation]);

  // Submit allocation with proof
  const submitAllocation = useCallback(async (
    allocationData: AllocationData, 
    identity: Identity, 
    group: Group
  ): Promise<{ success: boolean; transactionHash?: string }> => {
    if (!identity) {
      const errorMessage = 'Identity required for voting';
      setError({
        type: 'NOT_GROUP_MEMBER',
        message: errorMessage
      });
      showErrorToast(new Error(errorMessage));
      return { success: false };
    }

    if (hasVoted) {
      const errorMessage = 'You have already voted';
      setError({
        type: 'ALREADY_VOTED',
        message: errorMessage
      });
      showErrorToast(new Error(errorMessage));
      return { success: false };
    }

    let currentToastId = showLoadingToast('Submitting allocation...');

    try {
      setIsVoting(true);
      setError(null);

      // Generate proof
      dismissToast(currentToastId);
      currentToastId = showLoadingToast('Generating zero-knowledge proof...');
      
      const proof = await generateAllocationProof(allocationData, identity, group);

      console.log('allocation proof', proof);
      
      if (!proof) {
        throw new Error('Failed to generate allocation proof');
      }

      // Verify proof locally before submitting
      dismissToast(currentToastId);
      currentToastId = showLoadingToast('Verifying proof...');
      
      const isValidProof = await verifyProof(proof as unknown as SemaphoreProof);
      if (!isValidProof) {
        throw new Error('Generated proof is invalid');
      }

      const votingState = getCurrentVotingState();

      // Convert proof to enhanced format
      const enhancedProof: EnhancedSemaphoreProof = {
        merkleTreeDepth: proof.merkleTreeDepth.toString(),
        merkleTreeRoot: proof.merkleTreeRoot.toString(),
        nullifier: proof.nullifier.toString(),
        message: proof.message.toString(),
        scope: proof.scope.toString(),
        points: proof.points.map(p => p.toString())
      };

      // Submit allocation to backend
      dismissToast(currentToastId);
      currentToastId = showLoadingToast('Submitting to blockchain...');
      
      const submitRequest: SubmitVoteRequest = {
        asset: votingState.assetAddress,
        groupId: groupId!.toString(),
        unwindingEpochs: votingState.unwindingEpochs,
        liquidVotes: allocationData.liquidVotes,
        illiquidVotes: allocationData.illiquidVotes,
        proof: enhancedProof,
        nullifier: proof.nullifier.toString(),
      };

      console.log('📤 Submitting allocation with data:', {
        asset: votingState.assetAddress,
        groupId: groupId?.toString(),
        unwindingEpochs: votingState.unwindingEpochs,
        liquidCount: allocationData.liquidVotes.length,
        illiquidCount: allocationData.illiquidVotes.length
      });

      const response = await fetch(API_ENDPOINTS.submitVote, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitRequest),
      });

      if (!response.ok) {
        dismissToast(currentToastId);
        
        let errorData;
        try {
          errorData = await response.json() as SubmitVoteResponse;
        } catch {
          errorData = { error: await response.text() };
        }
        
        const errorMsg = errorData.error ?? `HTTP ${response.status}: ${response.statusText}`;
        const details = errorData.details ? ` Details: ${errorData.details}` : '';
        throw new Error(`${errorMsg}${details}`);
      }

      const result = await response.json() as SubmitVoteResponse;
      
      if (!result.success) {
        dismissToast(currentToastId);
        
        const errorMsg = result.error ?? 'Failed to submit allocation';
        const details = result.details ? ` Details: ${result.details}` : '';
        const originalError = result.originalError ? ` (${result.originalError})` : '';
        throw new Error(`${errorMsg}${details}${originalError}`);
      }

      dismissToast(currentToastId);
      
      // Mark user as having voted and refresh results
      setHasVoted(true);
      void refreshResults();
      
      showSuccessToast('Allocation submitted successfully!');
      return { success: true, transactionHash: result.transactionHash };
    } catch (err) {
      // Dismiss current toast on error
      dismissToast(currentToastId);
      
      let errorType: VotingError['type'] = 'SUBMISSION_FAILED';
      let errorMessage = 'Failed to submit allocation';

      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();
        
        if (errorMsg.includes('proof')) {
          errorType = 'PROOF_GENERATION_FAILED';
          errorMessage = 'Failed to generate allocation proof. Please try again.';
        } else if (errorMsg.includes('already voted') || errorMsg.includes('duplicate') || errorMsg.includes('nullifier')) {
          errorType = 'ALREADY_VOTED';
          errorMessage = 'You have already voted in this group';
        } else if (errorMsg.includes('smart contract execution failed') || errorMsg.includes('execution reverted')) {
          errorType = 'SUBMISSION_FAILED';
          errorMessage = 'Allocation was rejected by the smart contract. You may have already voted or the proof is invalid.';
        } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('gas')) {
          errorType = 'SUBMISSION_FAILED';
          errorMessage = 'Transaction failed due to insufficient funds for gas fees. Please contact support.';
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          errorType = 'SUBMISSION_FAILED';
          errorMessage = 'Network error occurred. Please check your connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }

      setError({ type: errorType, message: errorMessage });
      console.error('Error submitting allocation:', err);
      showErrorToast(err);
      return { success: false };
    } finally {
      setIsVoting(false);
    }
  }, [hasVoted, generateAllocationProof, groupId, refreshResults]);

  // Initialize vote results on mount only (not when dependencies change)
  useEffect(() => {
    void refreshResults();
  }, [refreshResults]); // Include refreshResults to satisfy linter

  return {
    hasVoted,
    voteResults,
    totalVotes,
    submitAllocation,
    refreshResults,
    isVoting,
    loading,
    error,
  };
}