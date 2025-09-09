import { useMemo } from 'react';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { Identity } from '@semaphore-protocol/identity';
import { semaphoreAbi } from '@/abis/semaphore';
import { getSemaphoreConfig } from '@/config/semaphore';

type SemaphoreGroupContractResult = {
  // Group data
  merkleTreeRoot: bigint | undefined;
  merkleTreeSize: bigint | undefined;
  merkleTreeDepth: bigint | undefined;
  groupAdmin: Address | undefined;
  
  // User membership
  isGroupMember: boolean;
  memberIndex: bigint | undefined;
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
  
  // Refetch functions
  refetchGroupData: () => void;
  refetchMembership: () => void;
};

/**
 * Hook to read Semaphore group data directly from the contract using wagmi
 * No more API calls needed - reads directly from blockchain!
 */
export function useSemaphoreGroupContract(userIdentity?: Identity): SemaphoreGroupContractResult {
  const config = getSemaphoreConfig();

  // Read group merkle tree root
  const { 
    data: merkleTreeRoot, 
    isLoading: isLoadingRoot,
    error: rootError,
    refetch: refetchRoot
  } = useReadContract({
    address: config.contractAddress,
    abi: semaphoreAbi,
    functionName: 'getMerkleTreeRoot',
    args: [config.groupId],
    query: {
      enabled: config.contractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Read group size (number of members)
  const { 
    data: merkleTreeSize,
    isLoading: isLoadingSize,
    error: sizeError,
    refetch: refetchSize
  } = useReadContract({
    address: config.contractAddress,
    abi: semaphoreAbi,
    functionName: 'getMerkleTreeSize',
    args: [config.groupId],
    query: {
      enabled: config.contractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Read merkle tree depth
  const { 
    data: merkleTreeDepth,
    isLoading: isLoadingDepth,
    error: depthError,
    refetch: refetchDepth
  } = useReadContract({
    address: config.contractAddress,
    abi: semaphoreAbi,
    functionName: 'getMerkleTreeDepth',
    args: [config.groupId],
    query: {
      enabled: config.contractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Read group admin
  const { 
    data: groupAdmin,
    isLoading: isLoadingAdmin,
    error: adminError,
    refetch: refetchAdmin
  } = useReadContract({
    address: config.contractAddress,
    abi: semaphoreAbi,
    functionName: 'getGroupAdmin',
    args: [config.groupId],
    query: {
      enabled: config.contractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Check if user is a group member (if they have an identity)
  const { 
    data: isGroupMember,
    isLoading: isLoadingMembership,
    error: membershipError,
    refetch: refetchMembership
  } = useReadContract({
    address: config.contractAddress,
    abi: semaphoreAbi,
    functionName: 'hasMember',
    args: userIdentity ? [config.groupId, BigInt(userIdentity.commitment.toString())] : undefined,
    query: {
      enabled: !!userIdentity && config.contractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Get user's member index if they are a member
  const { 
    data: memberIndex,
    refetch: refetchIndex
  } = useReadContract({
    address: config.contractAddress,
    abi: semaphoreAbi,
    functionName: 'indexOf',
    args: userIdentity ? [config.groupId, BigInt(userIdentity.commitment.toString())] : undefined,
    query: {
      enabled: !!userIdentity && !!isGroupMember && config.contractAddress !== '0x0000000000000000000000000000000000000000',
    },
    chainId: baseSepolia.id,
  });

  // Combine loading states
  const isLoading = useMemo(() => {
    return isLoadingRoot || isLoadingSize || isLoadingDepth || isLoadingAdmin || isLoadingMembership;
  }, [isLoadingRoot, isLoadingSize, isLoadingDepth, isLoadingAdmin, isLoadingMembership]);

  // Combine errors
  const error = useMemo(() => {
    return rootError ?? sizeError ?? depthError ?? adminError ?? membershipError ?? null;
  }, [rootError, sizeError, depthError, adminError, membershipError]);

  // Refetch all group data
  const refetchGroupData = useMemo(() => {
    return () => {
      void refetchRoot();
      void refetchSize();
      void refetchDepth(); 
      void refetchAdmin();
    };
  }, [refetchRoot, refetchSize, refetchDepth, refetchAdmin]);

  // Refetch membership data
  const refetchMembershipData = useMemo(() => {
    return () => {
      void refetchMembership();
      void refetchIndex();
    };
  }, [refetchMembership, refetchIndex]);

  return {
    // Group data
    merkleTreeRoot: merkleTreeRoot as bigint | undefined,
    merkleTreeSize: merkleTreeSize as bigint | undefined,
    merkleTreeDepth: merkleTreeDepth as bigint | undefined,
    groupAdmin: groupAdmin as Address | undefined,
    
    // User membership
    isGroupMember: !!isGroupMember,
    memberIndex: memberIndex as bigint | undefined,
    
    // Loading states
    isLoading,
    error,
    
    // Refetch functions
    refetchGroupData,
    refetchMembership: refetchMembershipData,
  };
}