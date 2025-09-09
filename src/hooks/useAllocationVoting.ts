import { useMemo } from 'react';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { abi as votingAbi } from '@/abis/voting';
import { semaphoreAbi } from '@/abis/semaphore';
import { baseSepolia } from 'viem/chains';

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
  const currentChain = baseSepolia.id;

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
    chainId: currentChain,
  });

  // Read group IDs
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
    chainId: currentChain,
  });

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
    chainId: currentChain,
  });

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
    chainId: currentChain,
  });

  // Read member counts for each group from Semaphore contract
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
    chainId: currentChain,
  });

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
    chainId: currentChain,
  });

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
    chainId: currentChain,
  });

  // Check user membership in each group
  const userCommitment = userIdentity ? BigInt(userIdentity.commitment.toString()) : undefined;

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
    chainId: currentChain,
  });

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
    chainId: currentChain,
  });

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
    chainId: currentChain,
  });

  // Combine loading states
  const isLoading = useMemo(() => {
    return isLoadingOwner || isLoadingShrimpId || isLoadingDolphinId || isLoadingWhaleId ||
           isLoadingShrimpMembers || isLoadingDolphinMembers || isLoadingWhaleMembers ||
           isLoadingShrimMembership || isLoadingDolphinMembership || isLoadingWhaleMembership;
  }, [
    isLoadingOwner, isLoadingShrimpId, isLoadingDolphinId, isLoadingWhaleId,
    isLoadingShrimpMembers, isLoadingDolphinMembers, isLoadingWhaleMembers,
    isLoadingShrimMembership, isLoadingDolphinMembership, isLoadingWhaleMembership
  ]);

  // Combine errors
  const error = useMemo(() => {
    return ownerError ?? shrimpIdError ?? dolphinIdError ?? whaleIdError ??
           shrimpMembersError ?? dolphinMembersError ?? whaleMembersError ??
           shrimpMembershipError ?? dolphinMembershipError ?? whaleMembershipError ?? null;
  }, [
    ownerError, shrimpIdError, dolphinIdError, whaleIdError,
    shrimpMembersError, dolphinMembersError, whaleMembersError,
    shrimpMembershipError, dolphinMembershipError, whaleMembershipError
  ]);

  // Refetch contract data
  const refetchContractData = useMemo(() => {
    return () => {
      void refetchOwner();
      void refetchShrimpId();
      void refetchDolphinId();
      void refetchWhaleId();
      void refetchShrimpMembers();
      void refetchDolphinMembers();
      void refetchWhaleMembers();
    };
  }, [refetchOwner, refetchShrimpId, refetchDolphinId, refetchWhaleId, refetchShrimpMembers, refetchDolphinMembers, refetchWhaleMembers]);

  // Refetch membership data
  const refetchMembershipData = useMemo(() => {
    return () => {
      void refetchShrimpMembership();
      void refetchDolphinMembership();
      void refetchWhaleMembership();
    };
  }, [refetchShrimpMembership, refetchDolphinMembership, refetchWhaleMembership]);

  return {
    // Contract data
    owner: owner as Address | undefined,
    shrimpGroupId: shrimpGroupId as bigint | undefined,
    dolphinGroupId: dolphinGroupId as bigint | undefined,
    whaleGroupId: whaleGroupId as bigint | undefined,
    
    // Group membership info
    shrimpMembers: shrimpMembers as bigint | undefined,
    dolphinMembers: dolphinMembers as bigint | undefined,
    whaleMembers: whaleMembers as bigint | undefined,
    
    // User membership status
    userGroupMembership: {
      isShrimp: !!isShrimp,
      isDolphin: !!isDolphin,
      isWhale: !!isWhale,
    },
    
    // Loading states
    isLoading,
    error,
    
    // Refetch functions
    refetchContractData,
    refetchMembershipData,
  };
}