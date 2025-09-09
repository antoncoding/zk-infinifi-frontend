import { useMemo } from 'react';
import { Address } from 'viem';
import { useVotingContractData } from './useVotingContractData';
import { useGroupMemberCounts } from './useGroupMemberCounts';

type AllocationVotingResult = {
  // Contract data
  owner: Address | undefined;
  shrimpGroupId: bigint | undefined;
  dolphinGroupId: bigint | undefined;
  whaleGroupId: bigint | undefined;
  
  // Group member counts
  shrimpMembers: bigint | undefined;
  dolphinMembers: bigint | undefined;
  whaleMembers: bigint | undefined;
  
  // States
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  refetchAll: () => void;
};

/**
 * Simplified hook to get voting contract data and member counts
 * Use useUserVotingGroup for user membership and group logic
 */
export function useAllocationVoting(
  votingContractAddress: Address,
  semaphoreContractAddress: Address
): AllocationVotingResult {
  // Get voting contract data (owner, group IDs)
  const {
    owner,
    shrimpGroupId,
    dolphinGroupId,
    whaleGroupId,
    isLoading: contractLoading,
    error: contractError,
    refetchAll: refetchContract
  } = useVotingContractData(votingContractAddress);

  // Get member counts for all groups
  const {
    shrimpMembers,
    dolphinMembers,
    whaleMembers,
    isLoading: memberCountsLoading,
    error: memberCountsError,
    refetchAll: refetchMemberCounts
  } = useGroupMemberCounts(semaphoreContractAddress, {
    shrimpGroupId,
    dolphinGroupId,
    whaleGroupId,
  });

  // Combined states
  const isLoading = useMemo(() => {
    return contractLoading || memberCountsLoading;
  }, [contractLoading, memberCountsLoading]);

  const error = useMemo(() => {
    return contractError ?? memberCountsError ?? null;
  }, [contractError, memberCountsError]);

  const refetchAll = useMemo(() => {
    return () => {
      refetchContract();
      refetchMemberCounts();
    };
  }, [refetchContract, refetchMemberCounts]);

  return {
    owner,
    shrimpGroupId,
    dolphinGroupId,
    whaleGroupId,
    shrimpMembers,
    dolphinMembers,
    whaleMembers,
    isLoading,
    error,
    refetchAll,
  };
}