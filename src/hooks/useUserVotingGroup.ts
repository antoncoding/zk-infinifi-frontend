import { useMemo } from 'react';
import { Address } from 'viem';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { useVotingContractData } from './useVotingContractData';
import { useUserGroupMembership } from './useUserGroupMembership';
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
      // For development: create group with user's identity
      // In production: would need to fetch all whale group members
      const group = new Group([userIdentity.commitment]);
      return {
        type: 'whale' as UserGroupType,
        groupId: whaleGroupId,
        group
      };
    }
    
    if (userGroupMembership.isDolphin && dolphinGroupId) {
      const group = new Group([userIdentity.commitment]);
      return {
        type: 'dolphin' as UserGroupType,
        groupId: dolphinGroupId,
        group
      };
    }
    
    if (userGroupMembership.isShrimp && shrimpGroupId) {
      const group = new Group([userIdentity.commitment]);
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
  }, [userIdentity, userGroupMembership, whaleGroupId, dolphinGroupId, shrimpGroupId]);

  // Combined loading state
  const isLoading = contractLoading || membershipLoading;

  // Combined error state
  const error = contractError ?? membershipError ?? null;

  // Combined refetch
  const refetchAll = useMemo(() => {
    return () => {
      refetchContract();
      refetchMembership();
    };
  }, [refetchContract, refetchMembership]);

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