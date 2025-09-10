import { useMemo } from 'react';
import { Address } from 'viem';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { useVotingContractData } from './useVotingContractData';
import { useUserGroupMembership } from './useUserGroupMembership';
import { useSemaphoreGroups } from './useSemaphoreGroups';
import { SEMAPHORE_CONTRACT_ADDRESS } from '@/config/semaphore';

export type UserGroupType = 'whale' | 'dolphin' | 'shrimp' | null;

type UserVotingGroupResult = {
  // Active voting group info
  activeGroup: {
    type: UserGroupType;
    groupId: bigint | undefined;
    group: Group | null; // For proof generation
  };
  
  // All group memberships
  memberships: {
    isWhale: boolean;
    isDolphin: boolean;
    isShrimp: boolean;
  };
  
  // Group IDs from contract
  groupIds: {
    whaleGroupId: bigint | undefined;
    dolphinGroupId: bigint | undefined;
    shrimpGroupId: bigint | undefined;
  };
  
  // States
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  refetchAll: () => void;
};

/**
 * Hook to manage user's voting group membership and create proper Group object for voting
 * Determines which group user should vote with and provides Group object for proof generation
 */
export function useUserVotingGroup(
  votingContractAddress: Address,
  userIdentity?: Identity
): UserVotingGroupResult {
  // Get group IDs from voting contract
  const {
    shrimpGroupId,
    dolphinGroupId, 
    whaleGroupId,
    isLoading: contractLoading,
    error: contractError,
    refetchAll: refetchContract
  } = useVotingContractData(votingContractAddress);

  // Check user membership across all groups
  const {
    userGroupMembership,
    isLoading: membershipLoading,
    error: membershipError,
    refetchAll: refetchMembership
  } = useUserGroupMembership(SEMAPHORE_CONTRACT_ADDRESS, {
    shrimpGroupId,
    dolphinGroupId,
    whaleGroupId,
  }, userIdentity);

  // Memoize group IDs to prevent infinite re-renders
  const memoizedGroupIds = useMemo(() => ({
    whaleGroupId,
    dolphinGroupId,
    shrimpGroupId,
  }), [whaleGroupId, dolphinGroupId, shrimpGroupId]);

  // Fetch proper Group objects from subgraph with all members
  const {
    groups: semaphoreGroups,
    isLoading: groupsLoading,
    error: groupsError,
    refetchAll: refetchGroups
  } = useSemaphoreGroups(memoizedGroupIds);

  // Determine active voting group (priority: whale > dolphin > shrimp)
  const activeGroup = useMemo(() => {
    if (!userIdentity) {
      return {
        type: null as UserGroupType,
        groupId: undefined,
        group: null
      };
    }

    // Priority order: whale > dolphin > shrimp
    if (userGroupMembership.isWhale && whaleGroupId) {
      const group = semaphoreGroups[whaleGroupId.toString()] ?? null;
      return {
        type: 'whale' as UserGroupType,
        groupId: whaleGroupId,
        group
      };
    }
    
    if (userGroupMembership.isDolphin && dolphinGroupId) {
      const group = semaphoreGroups[dolphinGroupId.toString()] ?? null;
      return {
        type: 'dolphin' as UserGroupType,
        groupId: dolphinGroupId,
        group
      };
    }
    
    if (userGroupMembership.isShrimp && shrimpGroupId) {
      const group = semaphoreGroups[shrimpGroupId.toString()] ?? null;
      return {
        type: 'shrimp' as UserGroupType,
        groupId: shrimpGroupId,
        group
      };
    }

    // User is not in any group
    return {
      type: null as UserGroupType,
      groupId: undefined,
      group: null
    };
  }, [userIdentity, userGroupMembership, whaleGroupId, dolphinGroupId, shrimpGroupId, semaphoreGroups]);

  // Combined loading state
  const isLoading = contractLoading || membershipLoading || groupsLoading;

  // Combined error state
  const error = contractError ?? membershipError ?? groupsError ?? null;

  // Combined refetch
  const refetchAll = useMemo(() => {
    return () => {
      refetchContract();
      refetchMembership();
      refetchGroups();
    };
  }, [refetchContract, refetchMembership, refetchGroups]);

  return {
    activeGroup,
    memberships: userGroupMembership,
    groupIds: {
      whaleGroupId,
      dolphinGroupId,
      shrimpGroupId,
    },
    isLoading,
    error,
    refetchAll,
  };
}