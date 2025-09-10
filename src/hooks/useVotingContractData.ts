import { useMemo } from 'react';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { abi as votingAbi } from '@/abis/voting';
import { baseSepolia } from 'viem/chains';

type VotingContractDataResult = {
  owner: Address | undefined;
  shrimpGroupId: bigint | undefined;
  dolphinGroupId: bigint | undefined;
  whaleGroupId: bigint | undefined;
  shrimpWeight: bigint | undefined;
  dolphinWeight: bigint | undefined;
  whaleWeight: bigint | undefined;
  isLoading: boolean;
  error: Error | null;
  refetchAll: () => void;
};

/**
 * Hook to read basic voting contract data
 * Reads contract owner and all group IDs
 */
export function useVotingContractData(
  votingContractAddress: Address
): VotingContractDataResult {
  // Read contract owner
  const { 
    data: owner, 
    isLoading: isLoadingOwner,
    error: ownerError,
    refetch: refetchOwner
  } = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'owner',
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Log errors for debugging
  if (ownerError) {
    console.error('❌ useVotingContractData - owner error:', {
      error: ownerError.message,
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000'
    });
  }

  // Read shrimp group ID
  const { 
    data: groupIds,
    isLoading: isLoadingIds,
    error: idError,
    refetch: refetchShrimpId
  } = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'getGroupIds',
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });


  if (idError) {
    console.error('❌ useVotingContractData - whale group ID error:', {
      error: idError.message,
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000'
    });
  }

  const shrimpGroupId = useMemo(() => groupIds && (groupIds as bigint[]).length >= 3 ? (groupIds as bigint[])[0] : BigInt(0), [groupIds])
  const dolphinGroupId = useMemo(() => groupIds && (groupIds as bigint[]).length >= 3 ? (groupIds as bigint[])[1] : BigInt(0), [groupIds])
  const whaleGroupId = useMemo(() => groupIds && (groupIds as bigint[]).length >= 3 ? (groupIds as bigint[])[2] : BigInt(0), [groupIds])

  // Read shrimp group weight
  const { 
    data: shrimpWeight,
    isLoading: isLoadingShrimpWeight,
    refetch: refetchShrimpWeight
  } = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'groupWeights',
    args: [shrimpGroupId],
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000' && shrimpGroupId !== BigInt(0),
    },
    chainId: baseSepolia.id,
  });

  // Read dolphin group weight
  const { 
    data: dolphinWeight,
    isLoading: isLoadingDolphinWeight,
    refetch: refetchDolphinWeight
  } = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'groupWeights',
    args: [dolphinGroupId],
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000' && dolphinGroupId !== BigInt(0),
    },
    chainId: baseSepolia.id,
  });

  // Read whale group weight
  const { 
    data: whaleWeight,
    isLoading: isLoadingWhaleWeight,
    refetch: refetchWhaleWeight
  } = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'groupWeights',
    args: [whaleGroupId],
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000' && whaleGroupId !== BigInt(0),
    },
    chainId: baseSepolia.id,
  });

  // Combine loading states
  const isLoading = useMemo(() => {
    return isLoadingOwner || isLoadingIds || isLoadingShrimpWeight || isLoadingDolphinWeight || isLoadingWhaleWeight;
  }, [isLoadingOwner, isLoadingIds, isLoadingShrimpWeight, isLoadingDolphinWeight, isLoadingWhaleWeight]);

  // Combine errors
  const error = useMemo(() => {
    return ownerError ?? idError ?? null;
  }, [ownerError, idError]);

  // Refetch all data
  const refetchAll = useMemo(() => {
    return () => {
      void refetchOwner();
      void refetchShrimpId();
      void refetchShrimpWeight();
      void refetchDolphinWeight();
      void refetchWhaleWeight();
    };
  }, [refetchOwner, refetchShrimpId, refetchShrimpWeight, refetchDolphinWeight, refetchWhaleWeight]);

  return {
    owner: owner as Address | undefined,
    shrimpGroupId: shrimpGroupId as bigint | undefined,
    dolphinGroupId: dolphinGroupId as bigint | undefined,
    whaleGroupId: whaleGroupId as bigint | undefined,
    shrimpWeight: shrimpWeight as bigint | undefined,
    dolphinWeight: dolphinWeight as bigint | undefined,
    whaleWeight: whaleWeight as bigint | undefined,
    isLoading,
    error,
    refetchAll,
  };
}