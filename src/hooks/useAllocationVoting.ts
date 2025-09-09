import { useMemo } from 'react';
import { Address } from 'viem';
import { Identity } from '@semaphore-protocol/identity';
import { useVotingContractData } from './useVotingContractData';
import { useGroupMemberCounts } from './useGroupMemberCounts';
import { useUserGroupMembership } from './useUserGroupMembership';

type AllocationVotingResult = {
  // Contract data
  owner: Address | undefined;
  shrimpGroupId: bigint | undefined;
  dolphinGroupId: bigint | undefined;
  whaleGroupId: bigint | undefined;
  
  // Group membership info (for each tier)
  shrimpMembers: bigint | undefined;
  dolphinMembers: bigint | undefined;
  whaleMembers: bigint | undefined;
  
  // User membership status
  userGroupMembership: {
    isShrimp: boolean;
    isDolphin: boolean;
    isWhale: boolean;
  };
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
  
  // Refetch functions
  refetchContractData: () => void;
  refetchMembershipData: () => void;
};

/**
 * Hook to read Allocation Voting contract data
 * Reads group IDs, member counts, and user membership across all tiers
 */
export function useAllocationVoting(
  votingContractAddress: Address,
  semaphoreContractAddress: Address,
  userIdentity?: Identity
): AllocationVotingResult {
  // Get voting contract data (owner, group IDs)
  const {
    owner,
    shrimpGroupId,
    dolphinGroupId,
    whaleGroupId,
    isLoading: contractLoading,
    error: contractError,
    refetchAll: refetchContractData
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

  // Get user membership status across all groups
  const {
    userGroupMembership,
    isLoading: membershipLoading,
    error: membershipError,
    refetchAll: refetchMembershipData
  } = useUserGroupMembership(semaphoreContractAddress, {
    shrimpGroupId,
    dolphinGroupId,
    whaleGroupId,
  }, userIdentity);

  // Combine all loading states
  const isLoading = useMemo(() => {
    return contractLoading || memberCountsLoading || membershipLoading;
  }, [contractLoading, memberCountsLoading, membershipLoading]);

  // Combine all errors
  const error = useMemo(() => {
    return contractError ?? memberCountsError ?? membershipError ?? null;
  }, [contractError, memberCountsError, membershipError]);

  // Combined refetch for contract data and member counts
  const refetchContractDataCombined = useMemo(() => {
    return () => {
      refetchContractData();
      refetchMemberCounts();
    };
  }, [refetchContractData, refetchMemberCounts]);

  return {
    // Contract data
    owner,
    shrimpGroupId,
    dolphinGroupId,
    whaleGroupId,
    
    // Group membership info
    shrimpMembers,
    dolphinMembers,
    whaleMembers,
    
    // User membership status
    userGroupMembership,
    
    // Loading states
    isLoading,
    error,
    
    // Refetch functions
    refetchContractData: refetchContractDataCombined,
    refetchMembershipData,
  };
}