import { useCallback, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { encodeFunctionData } from 'viem';
import { abi } from '@/abis/voting';
import { ALLOCATION_VOTING, MOCK_ASSET_ADDRESS } from '@/config/semaphore';
import { useTransactionWithToast } from './useTransactionWithToast';
import { SupportedNetworks } from '@/utils/networks';
import { useTokenBalance } from './useTokenBalance';
import { formatUnits } from 'viem';

type JoinGroupResult = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};

type JoinGroupHookResult = {
  joinGroup: (identity: Identity, groupId: bigint) => Promise<JoinGroupResult>;
  isJoining: boolean;
  error: string | null;
};

/**
 * Hook to handle joining Semaphore group via direct on-chain transaction
 * Uses the addMember function to add identity commitment to the group
 */
export function useSemaphoreJoinGroup(onSuccess?: () => void): JoinGroupHookResult {
  const { address, chainId } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { switchChainAsync } = useSwitchChain();

  const { balance } = useTokenBalance({
    token: MOCK_ASSET_ADDRESS,
    user: address
  });

  const MINIMUM_BALANCE = BigInt(1_000_000); // 1 iUSDC (6 decimals)
  const hasMinimumBalance = balance >= MINIMUM_BALANCE;

  const { sendTransactionAsync, isConfirming } = useTransactionWithToast({
    toastId: 'join-group',
    pendingText: 'Joining Semaphore group',
    successText: 'Successfully joined the group',
    errorText: 'Failed to join group',
    pendingDescription: 'Adding your identity to the group...',
    successDescription: 'Your identity has been added to the group',
  });

  const joinGroup = useCallback(async (identity: Identity, groupId: bigint): Promise<JoinGroupResult> => {
    if (!address) {
      const error = 'Wallet not connected';
      setError(error);
      return { success: false, error };
    }

    if (!hasMinimumBalance) {
      const balanceDisplay = formatUnits(balance, 6);
      const error = `Insufficient balance: ${balanceDisplay} iUSDC. Minimum 1 iUSDC required to join the voting group.`;
      setError(error);
      return { success: false, error };
    }

    try {
      setIsJoining(true);
      setError(null);

      console.log('Joining group on-chain:', {
        groupId: groupId.toString(),
        identityCommitment: identity.commitment.toString().slice(0, 10) + '...',
        contract: ALLOCATION_VOTING
      });

      if (chainId !== SupportedNetworks.BaseSepolia) {
        await switchChainAsync({chainId: SupportedNetworks.BaseSepolia})
      }

      // Send transaction directly to the Semaphore contract
      const result = await sendTransactionAsync({
        account: address,
        to: ALLOCATION_VOTING,
        data: encodeFunctionData({
          abi: abi,
          functionName: 'addMember',
          args: [groupId, identity.commitment],
        }),
        chainId: SupportedNetworks.BaseSepolia
      });

      console.log('Successfully joined group! Transaction:', result);
      
      // Call success callback
      onSuccess?.();
      
      return {
        success: true,
        transactionHash: result
      };

    } catch (err) {
      let errorMessage = 'Failed to join group';

      if (err instanceof Error) {
        if (err.message.includes('already a member') || err.message.includes('duplicate') || err.message.includes('LeafAlreadyExists')) {
          errorMessage = 'You are already a member of this group';
        } else if (err.message.includes('insufficient funds') || err.message.includes('gas')) {
          errorMessage = 'Transaction failed due to insufficient funds for gas fees';
        } else if (err.message.includes('network') || err.message.includes('connection')) {
          errorMessage = 'Network error occurred. Please check your connection and try again';
        } else if (err.message.includes('CallerIsNotTheGroupAdmin')) {
          errorMessage = 'Only the group admin can add members to this group';
        } else if (err.message.includes('GroupDoesNotExist')) {
          errorMessage = 'The specified group does not exist';
        } else if (err.message.includes('user rejected') || err.message.includes('denied')) {
          errorMessage = 'Transaction was rejected by user';
        } else {
          errorMessage = `Join failed: ${err.message}`;
        }
      }

      setError(errorMessage);
      console.error('Join group error:', err);
      return { success: false, error: errorMessage };

    } finally {
      setIsJoining(false);
    }
  }, [address, onSuccess, sendTransactionAsync, switchChainAsync, chainId, hasMinimumBalance, balance]);

  return {
    joinGroup,
    isJoining: isJoining || isConfirming,
    error,
  };
}