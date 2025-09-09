import { useCallback, useState, useEffect } from 'react';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof, verifyProof } from '@semaphore-protocol/proof';
import { getSemaphoreConfig, API_ENDPOINTS } from '@/config/semaphore';
import { 
  SubmitVoteRequest,
  SubmitVoteResponse,
  VoteResultsResponse,
  VotingError,
  SemaphoreProofData
} from '@/types/semaphore';

type SemaphoreVotingHookResult = {
  hasVoted: boolean;
  voteResults: Record<string, number>;
  totalVotes: number;
  submitVote: (voteOption: number, identity: Identity, group: Group) => Promise<boolean>;
  refreshResults: () => Promise<void>;
  isVoting: boolean;
  loading: boolean;
  error: VotingError | null;
};

/**
 * Hook to manage Semaphore voting operations
 * Handles vote submission, proof generation, and results fetching
 */
export function useSemaphoreVoting(userIdentity?: Identity): SemaphoreVotingHookResult {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteResults, setVoteResults] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<VotingError | null>(null);

  const config = getSemaphoreConfig();

  // Fetch voting results and check if user has voted
  const fetchVoteResults = useCallback(async (): Promise<VoteResultsResponse> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.getVoteResults}?groupId=${config.groupId}`);
      
      if (!response.ok) {
        // Return empty results if API not available yet (development mode)
        if (response.status === 404) {
          console.warn('Vote results API not available yet, returning empty results');
          return { results: {}, totalVotes: 0, nullifiers: [] };
        }
        throw new Error(`Failed to fetch vote results: ${response.statusText}`);
      }

      const data = await response.json() as VoteResultsResponse;
      return data;
    } catch (err) {
      // In development, return empty results if backend not available
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Backend API not available, using empty results for development');
        return { results: {}, totalVotes: 0, nullifiers: [] };
      }
      console.error('Error fetching vote results:', err);
      throw err;
    }
  }, [config.groupId]);

  // Check if user has already voted by checking nullifiers
  const checkUserVotingStatus = useCallback((nullifiers: string[], userCommitment?: string): boolean => {
    if (!userCommitment || !userIdentity) return false;
    
    // Generate the expected nullifier for this user's identity and scope
    // Note: In a real implementation, you'd want to check against the actual nullifier
    // For now, we'll use a simplified check
    try {
      // This is a simplified check - in production you'd generate the actual nullifier
      // and check if it exists in the nullifiers array
      return false; // TODO: Implement proper nullifier checking
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
      if (!(err instanceof TypeError && err.message.includes('fetch'))) {
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
  }, [loading, fetchVoteResults]);

  // Generate voting proof
  const generateVotingProof = useCallback(async (
    voteOption: number, 
    identity: Identity, 
    group: Group
  ): Promise<SemaphoreProofData | null> => {
    try {
      // Create the message (vote option) as a bigint
      const message = BigInt(voteOption);
      
      // Use group ID as scope to prevent double voting
      const scope = config.groupId;

      console.log('group', group)

      // Generate the proof
      const proof = await generateProof(identity, group, message, scope);
      
      return proof as SemaphoreProofData;
    } catch (err) {
      console.error('Error generating voting proof:', err);
      throw new Error('Failed to generate voting proof');
    }
  }, [config.groupId]);

  // Submit vote with proof
  const submitVote = useCallback(async (
    voteOption: number, 
    identity: Identity, 
    group: Group
  ): Promise<boolean> => {
    if (!identity) {
      setError({
        type: 'NOT_GROUP_MEMBER',
        message: 'Identity required for voting'
      });
      return false;
    }

    if (hasVoted) {
      setError({
        type: 'ALREADY_VOTED',
        message: 'You have already voted'
      });
      return false;
    }

    try {
      setIsVoting(true);
      setError(null);

      // Generate proof
      const proof = await generateVotingProof(voteOption, identity, group);
      
      if (!proof) {
        throw new Error('Failed to generate voting proof');
      }

      // Verify proof locally before submitting
      const isValidProof = await verifyProof(proof);
      if (!isValidProof) {
        throw new Error('Generated proof is invalid');
      }

      // Submit vote to backend
      const submitRequest: SubmitVoteRequest = {
        vote: voteOption,
        proof,
        nullifier: proof.nullifier.toString(),
      };

      const response = await fetch(API_ENDPOINTS.submitVote, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submitRequest,
          groupId: config.groupId.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Vote submission failed: ${errorData}`);
      }

      const result = await response.json() as SubmitVoteResponse;
      
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to submit vote');
      }

      // Mark user as having voted and refresh results
      setHasVoted(true);
      void refreshResults();
      
      return true;
    } catch (err) {
      let errorType: VotingError['type'] = 'SUBMISSION_FAILED';
      let errorMessage = 'Failed to submit vote';

      if (err instanceof Error) {
        if (err.message.includes('proof')) {
          errorType = 'PROOF_GENERATION_FAILED';
          errorMessage = 'Failed to generate voting proof. Please try again.';
        } else if (err.message.includes('already voted') || err.message.includes('duplicate')) {
          errorType = 'ALREADY_VOTED';
          errorMessage = 'You have already voted';
        } else {
          errorMessage = err.message;
        }
      }

      setError({ type: errorType, message: errorMessage });
      console.error('Error submitting vote:', err);
      return false;
    } finally {
      setIsVoting(false);
    }
  }, [hasVoted, generateVotingProof, config.groupId]);

  // Initialize vote results on mount only (not when dependencies change)
  useEffect(() => {
    void refreshResults();
  }, []); // Empty dependency array to run only once

  return {
    hasVoted,
    voteResults,
    totalVotes,
    submitVote,
    refreshResults,
    isVoting,
    loading,
    error,
  };
}