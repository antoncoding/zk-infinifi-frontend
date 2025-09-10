import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { API_ENDPOINTS } from '@/config/semaphore';

type JoinGroupRequest = {
  walletAddress: string;
  signature: string;
  identityCommitment: string;
  groupId: string;
};

type JoinGroupResponse = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};

type JoinGroupHookResult = {
  joinGroup: (identity: Identity, groupId: bigint, storedSignature?: string) => Promise<boolean>;
  isJoining: boolean;
  error: string | null;
};

/**
 * Hook to handle joining Semaphore group via API
 * Handles signature generation and API call
 */
export function useSemaphoreJoinGroup(onSuccess?: () => void): JoinGroupHookResult {
  const { address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinGroup = useCallback(async (identity: Identity, groupId: bigint, storedSignature?: string): Promise<boolean> => {
    if (!address) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setIsJoining(true);
      setError(null);

      // Use stored signature or throw error if not available
      if (!storedSignature) {
        throw new Error('No signature available. Please generate identity first.');
      }
      
      const signature = storedSignature;

      // Prepare API request
      const requestBody: JoinGroupRequest = {
        walletAddress: address,
        signature,
        identityCommitment: identity.commitment.toString(),
        groupId: groupId.toString(),
      };

      console.log('Sending join group request to API:', {
        walletAddress: address,
        identityCommitment: identity.commitment.toString().slice(0, 10) + '...',
        groupId: groupId.toString()
      });

      // Call API
      const response = await fetch(API_ENDPOINTS.joinGroup, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed (${response.status}): ${errorData}`);
      }

      const result = await response.json() as JoinGroupResponse;

      if (!result.success) {
        throw new Error(result.error ?? 'Join group API returned failure');
      }

      console.log('Successfully joined group! Transaction:', result.transactionHash);
      
      // Call success callback
      onSuccess?.();
      
      return true;

    } catch (err) {
      let errorMessage = 'Failed to join group';

      if (err instanceof Error) {
        if (err.message.includes('No signature available')) {
          errorMessage = 'Please generate your identity first before joining';
        } else if (err.message.includes('API request failed')) {
          errorMessage = err.message;
        } else {
          errorMessage = `Join failed: ${err.message}`;
        }
      }

      setError(errorMessage);
      console.error('Join group error:', err);
      return false;

    } finally {
      setIsJoining(false);
    }
  }, [address, onSuccess]);

  return {
    joinGroup,
    isJoining,
    error,
  };
}