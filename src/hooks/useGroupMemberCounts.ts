import { useMemo } from 'react';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { semaphoreAbi } from '@/abis/semaphore';
import { baseSepolia } from 'viem/chains';

type GroupMemberCountsResult = {
  shrimpMembers: bigint | undefined;
  dolphinMembers: bigint | undefined;
  whaleMembers: bigint | undefined;
  isLoading: boolean;
  error: Error | null;
  refetchAll: () => void;
};

/**
 * Hook to read member counts for all groups from Semaphore contract
 */
export function useGroupMemberCounts(
  semaphoreContractAddress: Address,
  groupIds: {
    shrimpGroupId?: bigint;
    dolphinGroupId?: bigint;
    whaleGroupId?: bigint;
  }
): GroupMemberCountsResult {
  const { shrimpGroupId, dolphinGroupId, whaleGroupId } = groupIds;

  // Read shrimp group member count
  const { 
    data: shrimpMembers,
    isLoading: isLoadingShrimpMembers,
    error: shrimpMembersError,
    refetch: refetchShrimpMembers
  } = useReadContract({
    address: semaphoreContractAddress,
    abi: semaphoreAbi,
    functionName: 'getMerkleTreeSize',
    args: shrimpGroupId !== undefined ? [shrimpGroupId] : undefined,
    query: {
      enabled: shrimpGroupId !== undefined && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Read dolphin group member count
  const { 
    data: dolphinMembers,
    isLoading: isLoadingDolphinMembers,
    error: dolphinMembersError,
    refetch: refetchDolphinMembers
  } = useReadContract({
    address: semaphoreContractAddress,
    abi: semaphoreAbi,
    functionName: 'getMerkleTreeSize',
    args: dolphinGroupId !== undefined ? [dolphinGroupId] : undefined,
    query: {
      enabled: dolphinGroupId !== undefined && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Read whale group member count
  const { 
    data: whaleMembers,
    isLoading: isLoadingWhaleMembers,
    error: whaleMembersError,
    refetch: refetchWhaleMembers
  } = useReadContract({
    address: semaphoreContractAddress,
    abi: semaphoreAbi,
    functionName: 'getMerkleTreeSize',
    args: whaleGroupId !== undefined ? [whaleGroupId] : undefined,
    query: {
      enabled: whaleGroupId !== undefined && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Combine loading states
  const isLoading = useMemo(() => {
    return isLoadingShrimpMembers || isLoadingDolphinMembers || isLoadingWhaleMembers;
  }, [isLoadingShrimpMembers, isLoadingDolphinMembers, isLoadingWhaleMembers]);

  // Log specific errors for debugging
  if (shrimpMembersError) {
    console.error('❌ useGroupMemberCounts - shrimp members error:', {
      error: shrimpMembersError.message,
      shrimpGroupId: shrimpGroupId?.toString(),
      enabled: shrimpGroupId !== undefined
    });
  }
  if (dolphinMembersError) {
    console.error('❌ useGroupMemberCounts - dolphin members error:', {
      error: dolphinMembersError.message,
      dolphinGroupId: dolphinGroupId?.toString(),
      enabled: dolphinGroupId !== undefined
    });
  }
  if (whaleMembersError) {
    console.error('❌ useGroupMemberCounts - whale members error:', {
      error: whaleMembersError.message,
      whaleGroupId: whaleGroupId?.toString(),
      enabled: whaleGroupId !== undefined
    });
  }

  // Combine errors
  const error = useMemo(() => {
    return shrimpMembersError ?? dolphinMembersError ?? whaleMembersError ?? null;
  }, [shrimpMembersError, dolphinMembersError, whaleMembersError]);

  // Refetch all data (only refetch if group IDs are available)
  const refetchAll = useMemo(() => {
    return () => {
      console.log('🔄 Refetching group member counts:', {
        shrimpGroupId: shrimpGroupId?.toString(),
        dolphinGroupId: dolphinGroupId?.toString(),
        whaleGroupId: whaleGroupId?.toString()
      });
      
      if (shrimpGroupId !== undefined) void refetchShrimpMembers();
      if (dolphinGroupId !== undefined) void refetchDolphinMembers();
      if (whaleGroupId !== undefined) void refetchWhaleMembers();
    };
  }, [refetchShrimpMembers, refetchDolphinMembers, refetchWhaleMembers, shrimpGroupId, dolphinGroupId, whaleGroupId]);

  return {
    shrimpMembers: shrimpMembers as bigint | undefined,
    dolphinMembers: dolphinMembers as bigint | undefined,
    whaleMembers: whaleMembers as bigint | undefined,
    isLoading,
    error,
    refetchAll,
  };
}