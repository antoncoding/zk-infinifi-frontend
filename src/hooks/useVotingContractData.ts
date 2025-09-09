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

  // Read shrimp group ID
  const { 
    data: shrimpGroupId,
    isLoading: isLoadingShrimpId,
    error: shrimpIdError,
    refetch: refetchShrimpId
  } = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'shrimpGroupId',
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Read dolphin group ID
  const { 
    data: dolphinGroupId,
    isLoading: isLoadingDolphinId,
    error: dolphinIdError,
    refetch: refetchDolphinId
  } = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'dolphinGroupId',
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Read whale group ID
  const { 
    data: whaleGroupId,
    isLoading: isLoadingWhaleId,
    error: whaleIdError,
    refetch: refetchWhaleId
  } = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'whaleGroupId',
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Combine loading states
  const isLoading = useMemo(() => {
    return isLoadingOwner || isLoadingShrimpId || isLoadingDolphinId || isLoadingWhaleId;
  }, [isLoadingOwner, isLoadingShrimpId, isLoadingDolphinId, isLoadingWhaleId]);

  // Combine errors
  const error = useMemo(() => {
    return ownerError ?? shrimpIdError ?? dolphinIdError ?? whaleIdError ?? null;
  }, [ownerError, shrimpIdError, dolphinIdError, whaleIdError]);

  // Refetch all data
  const refetchAll = useMemo(() => {
    return () => {
      void refetchOwner();
      void refetchShrimpId();
      void refetchDolphinId();
      void refetchWhaleId();
    };
  }, [refetchOwner, refetchShrimpId, refetchDolphinId, refetchWhaleId]);

  return {
    owner: owner as Address | undefined,
    shrimpGroupId: shrimpGroupId as bigint | undefined,
    dolphinGroupId: dolphinGroupId as bigint | undefined,
    whaleGroupId: whaleGroupId as bigint | undefined,
    isLoading,
    error,
    refetchAll,
  };
}