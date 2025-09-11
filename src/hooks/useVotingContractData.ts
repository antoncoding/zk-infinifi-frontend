import { useMemo } from 'react';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { abi as votingAbi } from '@/abis/voting';
import { baseSepolia } from 'viem/chains';
import { getCurrentVotingState } from '@/config/semaphore';

type FarmWeightData = {
  epoch: number;
  currentWeight: bigint;
  nextWeight: bigint;
};

type VotingContractDataResult = {
  owner: Address | undefined;
  shrimpGroupId: bigint | undefined;
  dolphinGroupId: bigint | undefined;
  whaleGroupId: bigint | undefined;
  shrimpWeight: bigint | undefined;
  dolphinWeight: bigint | undefined;
  whaleWeight: bigint | undefined;
  // Farm weight data for liquid and illiquid assets
  liquidFarmWeights: Record<string, FarmWeightData>;
  illiquidFarmWeights: Record<string, FarmWeightData>;
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
  const votingState = getCurrentVotingState();
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

  // Read farm weight data for each liquid asset individually
  const liquidFarm1Query = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'farmWeightData',
    args: [votingState.liquidAssets[0]?.address as Address],
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000' && !!votingState.liquidAssets[0]?.address,
    },
    chainId: baseSepolia.id,
  });

  const liquidFarm2Query = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'farmWeightData',
    args: [votingState.liquidAssets[1]?.address as Address],
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000' && !!votingState.liquidAssets[1]?.address,
    },
    chainId: baseSepolia.id,
  });

  // Read farm weight data for each illiquid asset individually
  const illiquidFarm1Query = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'farmWeightData',
    args: [votingState.illiquidAssets[0]?.address as Address],
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000' && !!votingState.illiquidAssets[0]?.address,
    },
    chainId: baseSepolia.id,
  });

  const illiquidFarm2Query = useReadContract({
    address: votingContractAddress,
    abi: votingAbi,
    functionName: 'farmWeightData',
    args: [votingState.illiquidAssets[1]?.address as Address],
    query: {
      enabled: votingContractAddress !== '0x0000000000000000000000000000000000000000' && !!votingState.illiquidAssets[1]?.address,
    },
    chainId: baseSepolia.id,
  });

  // Process farm weight data into structured format
  const liquidFarmWeights = useMemo(() => {
    const weights: Record<string, FarmWeightData> = {};
    
    if (liquidFarm1Query.data && votingState.liquidAssets[0]) {
      const [epoch, currentWeight, nextWeight] = liquidFarm1Query.data as [number, bigint, bigint];
      weights[votingState.liquidAssets[0].id] = { epoch, currentWeight, nextWeight };
    }
    
    if (liquidFarm2Query.data && votingState.liquidAssets[1]) {
      const [epoch, currentWeight, nextWeight] = liquidFarm2Query.data as [number, bigint, bigint];
      weights[votingState.liquidAssets[1].id] = { epoch, currentWeight, nextWeight };
    }
    
    return weights;
  }, [liquidFarm1Query.data, liquidFarm2Query.data, votingState.liquidAssets]);

  const illiquidFarmWeights = useMemo(() => {
    const weights: Record<string, FarmWeightData> = {};
    
    if (illiquidFarm1Query.data && votingState.illiquidAssets[0]) {
      const [epoch, currentWeight, nextWeight] = illiquidFarm1Query.data as [number, bigint, bigint];
      weights[votingState.illiquidAssets[0].id] = { epoch, currentWeight, nextWeight };
    }
    
    if (illiquidFarm2Query.data && votingState.illiquidAssets[1]) {
      const [epoch, currentWeight, nextWeight] = illiquidFarm2Query.data as [number, bigint, bigint];
      weights[votingState.illiquidAssets[1].id] = { epoch, currentWeight, nextWeight };
    }
    
    return weights;
  }, [illiquidFarm1Query.data, illiquidFarm2Query.data, votingState.illiquidAssets]);

  // Combine loading states
  const isLoading = useMemo(() => {
    const farmQueriesLoading = liquidFarm1Query.isLoading || liquidFarm2Query.isLoading || illiquidFarm1Query.isLoading || illiquidFarm2Query.isLoading;
    return isLoadingOwner || isLoadingIds || isLoadingShrimpWeight || isLoadingDolphinWeight || isLoadingWhaleWeight || farmQueriesLoading;
  }, [isLoadingOwner, isLoadingIds, isLoadingShrimpWeight, isLoadingDolphinWeight, isLoadingWhaleWeight, liquidFarm1Query.isLoading, liquidFarm2Query.isLoading, illiquidFarm1Query.isLoading, illiquidFarm2Query.isLoading]);

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
      // Refetch farm weight data
      void liquidFarm1Query.refetch();
      void liquidFarm2Query.refetch();
      void illiquidFarm1Query.refetch();
      void illiquidFarm2Query.refetch();
    };
  }, [refetchOwner, refetchShrimpId, refetchShrimpWeight, refetchDolphinWeight, refetchWhaleWeight, liquidFarm1Query, liquidFarm2Query, illiquidFarm1Query, illiquidFarm2Query]);

  return {
    owner: owner as Address | undefined,
    shrimpGroupId: shrimpGroupId as bigint | undefined,
    dolphinGroupId: dolphinGroupId as bigint | undefined,
    whaleGroupId: whaleGroupId as bigint | undefined,
    shrimpWeight: shrimpWeight as bigint | undefined,
    dolphinWeight: dolphinWeight as bigint | undefined,
    whaleWeight: whaleWeight as bigint | undefined,
    liquidFarmWeights,
    illiquidFarmWeights,
    isLoading,
    error,
    refetchAll,
  };
}