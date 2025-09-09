import { useCallback, useState, useEffect } from 'react';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
// import { getSemaphoreConfig } from '@/config/semaphore';
import { 
  VotingError
} from '@/types/semaphore';

type SemaphoreVotingHookResult = {
  hasVoted: boolean;
  voteResults: Record<string, number>;
  totalVotes: number;
  submitVote: (voteOption: number, identity: Identity, group: Group) => Promise<boolean>;
  isVoting: boolean;
  loading: boolean;
  error: VotingError | null;
};

/**
 * Simplified hook to manage Semaphore voting operations
 * Avoids infinite re-renders by using minimal dependencies
 */
export function useSemaphoreVoting(): SemaphoreVotingHookResult {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteResults, setVoteResults] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<VotingError | null>(null);
  const [initialized, setInitialized] = useState(false);

  // const config = getSemaphoreConfig(); // Not used in development mode

  // Single initialization effect
  useEffect(() => {
    if (initialized) return;

    const initializeVoting = async () => {
      try {
        setLoading(true);
        setError(null);

        // For development: create empty vote results
        setVoteResults({});
        setTotalVotes(0);
        setHasVoted(false);
        setInitialized(true);
        
        console.log('Initialized empty vote results for development');
      } catch {
        setError({
          type: 'SUBMISSION_FAILED',
          message: 'Failed to initialize voting'
        });
      } finally {
        setLoading(false);
      }
    };

    void initializeVoting();
  }, [initialized]);

  // Submit vote function
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

      // For development: simulate voting
      console.log('Simulating vote submission for development:', {
        voteOption,
        commitment: identity.commitment.toString(),
        groupSize: group.size
      });

      // Simulate proof generation and submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In development, mark vote as cast and update results
      setHasVoted(true);
      setVoteResults(prev => ({
        ...prev,
        [voteOption.toString()]: (prev[voteOption.toString()] || 0) + 1
      }));
      setTotalVotes(prev => prev + 1);
      
      return true;
    } catch {
      setError({
        type: 'SUBMISSION_FAILED',
        message: 'Simulated vote submission for development'
      });
      return false;
    } finally {
      setIsVoting(false);
    }
  }, [hasVoted]);

  return {
    hasVoted,
    voteResults,
    totalVotes,
    submitVote,
    isVoting,
    loading,
    error,
  };
}