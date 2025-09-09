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
    args: (shrimpGroupId !== undefined && userCommitment !== undefined) ? [shrimpGroupId, userCommitment] : undefined,
    query: {
      enabled: shrimpGroupId !== undefined && userCommitment !== undefined && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
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
    args: (dolphinGroupId !== undefined && userCommitment !== undefined) ? [dolphinGroupId, userCommitment] : undefined,
    query: {
      enabled: dolphinGroupId !== undefined && userCommitment !== undefined && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
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
    args: (whaleGroupId !== undefined && userCommitment !== undefined) ? [whaleGroupId, userCommitment] : undefined,
    query: {
      enabled: whaleGroupId !== undefined && userCommitment !== undefined && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Log specific errors for debugging
  if (shrimpMembershipError) {
    console.error('❌ useUserGroupMembership - shrimp membership error:', {
      error: shrimpMembershipError.message,
      shrimpGroupId: shrimpGroupId?.toString(),
      userCommitment: userCommitment?.toString(),
      enabled: shrimpGroupId !== undefined && userCommitment !== undefined
    });
  }
  if (dolphinMembershipError) {
    console.error('❌ useUserGroupMembership - dolphin membership error:', {
      error: dolphinMembershipError.message,
      dolphinGroupId: dolphinGroupId?.toString(),
      userCommitment: userCommitment?.toString(),
      enabled: dolphinGroupId !== undefined && userCommitment !== undefined
    });
  }
  if (whaleMembershipError) {
    console.error('❌ useUserGroupMembership - whale membership error:', {
      error: whaleMembershipError.message,
      whaleGroupId: whaleGroupId?.toString(),
      userCommitment: userCommitment?.toString(),
      enabled: whaleGroupId !== undefined && userCommitment !== undefined
    });
  }

  // Combine loading states
  const isLoading = useMemo(() => {
    return isLoadingShrimMembership || isLoadingDolphinMembership || isLoadingWhaleMembership;
  }, [isLoadingShrimMembership, isLoadingDolphinMembership, isLoadingWhaleMembership]);

  // Combine errors
  const error = useMemo(() => {
    return shrimpMembershipError ?? dolphinMembershipError ?? whaleMembershipError ?? null;
  }, [shrimpMembershipError, dolphinMembershipError, whaleMembershipError]);

  // Refetch all membership data (only refetch if group IDs and user commitment are available)
  const refetchAll = useMemo(() => {
    return () => {
      if (shrimpGroupId !== undefined && userCommitment !== undefined) void refetchShrimpMembership();
      if (dolphinGroupId !== undefined && userCommitment !== undefined) void refetchDolphinMembership();
      if (whaleGroupId !== undefined && userCommitment !== undefined) void refetchWhaleMembership();
    };
  }, [refetchShrimpMembership, refetchDolphinMembership, refetchWhaleMembership, shrimpGroupId, dolphinGroupId, whaleGroupId, userCommitment]);

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