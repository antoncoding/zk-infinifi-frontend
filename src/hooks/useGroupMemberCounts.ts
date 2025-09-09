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
    args: shrimpGroupId ? [shrimpGroupId] : undefined,
    query: {
      enabled: !!shrimpGroupId && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
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
    args: dolphinGroupId ? [dolphinGroupId] : undefined,
    query: {
      enabled: !!dolphinGroupId && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
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
    args: whaleGroupId ? [whaleGroupId] : undefined,
    query: {
      enabled: !!whaleGroupId && semaphoreContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Combine loading states
  const isLoading = useMemo(() => {
    return isLoadingShrimpMembers || isLoadingDolphinMembers || isLoadingWhaleMembers;
  }, [isLoadingShrimpMembers, isLoadingDolphinMembers, isLoadingWhaleMembers]);

  // Combine errors
  const error = useMemo(() => {
    return shrimpMembersError ?? dolphinMembersError ?? whaleMembersError ?? null;
  }, [shrimpMembersError, dolphinMembersError, whaleMembersError]);

  // Refetch all data
  const refetchAll = useMemo(() => {
    return () => {
      void refetchShrimpMembers();
      void refetchDolphinMembers();
      void refetchWhaleMembers();
    };
  }, [refetchShrimpMembers, refetchDolphinMembers, refetchWhaleMembers]);

  return {
    shrimpMembers: shrimpMembers as bigint | undefined,
    dolphinMembers: dolphinMembers as bigint | undefined,
    whaleMembers: whaleMembers as bigint | undefined,
    isLoading,
    error,
    refetchAll,
  };
}