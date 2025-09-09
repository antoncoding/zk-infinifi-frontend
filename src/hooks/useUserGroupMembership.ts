import { useMemo } from 'react';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { semaphoreAbi } from '@/abis/semaphore';
import { baseSepolia } from 'viem/chains';

type UserGroupMembershipResult = {
  userGroupMembership: {
    isShrimp: boolean;
    isDolphin: boolean;
    isWhale: boolean;
  };
  isLoading: boolean;
  error: Error | null;
  refetchAll: () => void;
};

/**
 * Hook to check user membership across all groups
 */
export function useUserGroupMembership(
  semaphoreContractAddress: Address,
  groupIds: {
    shrimpGroupId?: bigint;
    dolphinGroupId?: bigint;
    whaleGroupId?: bigint;
  },
  userIdentity?: Identity
): UserGroupMembershipResult {
  const { shrimpGroupId, dolphinGroupId, whaleGroupId } = groupIds;
  const userCommitment = userIdentity ? BigInt(userIdentity.commitment.toString()) : undefined;

  // Check shrimp group membership
  const { 
    data: isShrimp,
    isLoading: isLoadingShrimMembership,
    error: shrimpMembershipError,
    refetch: refetchShrimpMembership
  } = useReadContract({
    address: semaphoreContractAddress,
    abi: semaphoreAbi,
    functionName: 'hasMember',
    args: shrimpGroupId && userCommitment ? [shrimpGroupId, userCommitment] : undefined,
    query: {
      enabled: !!shrimpGroupId && !!userCommitment && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Check dolphin group membership
  const { 
    data: isDolphin,
    isLoading: isLoadingDolphinMembership,
    error: dolphinMembershipError,
    refetch: refetchDolphinMembership
  } = useReadContract({
    address: semaphoreContractAddress,
    abi: semaphoreAbi,
    functionName: 'hasMember',
    args: dolphinGroupId && userCommitment ? [dolphinGroupId, userCommitment] : undefined,
    query: {
      enabled: !!dolphinGroupId && !!userCommitment && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Check whale group membership
  const { 
    data: isWhale,
    isLoading: isLoadingWhaleMembership,
    error: whaleMembershipError,
    refetch: refetchWhaleMembership
  } = useReadContract({
    address: semaphoreContractAddress,
    abi: semaphoreAbi,
    functionName: 'hasMember',
    args: whaleGroupId && userCommitment ? [whaleGroupId, userCommitment] : undefined,
    query: {
      enabled: !!whaleGroupId && !!userCommitment && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Combine loading states
  const isLoading = useMemo(() => {
    return isLoadingShrimMembership || isLoadingDolphinMembership || isLoadingWhaleMembership;
  }, [isLoadingShrimMembership, isLoadingDolphinMembership, isLoadingWhaleMembership]);

  // Combine errors
  const error = useMemo(() => {
    return shrimpMembershipError ?? dolphinMembershipError ?? whaleMembershipError ?? null;
  }, [shrimpMembershipError, dolphinMembershipError, whaleMembershipError]);

  // Refetch all membership data
  const refetchAll = useMemo(() => {
    return () => {
      void refetchShrimpMembership();
      void refetchDolphinMembership();
      void refetchWhaleMembership();
    };
  }, [refetchShrimpMembership, refetchDolphinMembership, refetchWhaleMembership]);

  return {
    userGroupMembership: {
      isShrimp: !!isShrimp,
      isDolphin: !!isDolphin,
      isWhale: !!isWhale,
    },
    isLoading,
    error,
    refetchAll,
  };
}