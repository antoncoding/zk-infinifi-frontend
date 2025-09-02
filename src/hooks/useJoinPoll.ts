import { Address, encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';
import { pollAbi } from '@/abis/poll';
import { SupportedNetworks } from '@/utils/networks';
import { Keypair, PubKey } from '@maci-protocol/domainobjs';
import { useTransactionWithToast } from './useTransactionWithToast';
import { usePollSharedData } from './usePollSharedData';
import { useCallback } from 'react';
import { DEFAULT_IVCP_DATA, DEFAULT_SIGNUP_POLICY_DATA } from '@/lib/maci';

type JoinPollHookResult = {
  hasJoined: boolean;
  nullifier: bigint | null;
  joinPoll: (zkProof: string[], stateRootIndex: number, userPublicKey: PubKey) => Promise<void>;
  isConfirming: boolean;
  isConfirmed: boolean;
  refresh: (() => Promise<unknown>) | undefined;
};

type Props = {
  poll: Address;
  pollId: bigint;
  keyPair: Keypair | null;
  refetchInterval?: number;
  chainId?: SupportedNetworks;
  onTransactionSuccess?: () => void;
}

export function useJoinPoll({
  poll,
  pollId,
  keyPair,
  chainId = SupportedNetworks.BaseSepolia,
  refetchInterval = 30000, // Increased to 30 seconds
  onTransactionSuccess,
}: Props): JoinPollHookResult {
  
  const { address } = useAccount();
  
  // Use shared data hook instead of individual calls
  const { hasJoined, nullifier, refresh } = usePollSharedData({
    poll,
    pollId,
    keyPair,
    refetchInterval,
    chainId,
  });

  const { sendTransactionAsync, isConfirming, isConfirmed } = useTransactionWithToast({
    toastId: 'join-poll',
    pendingText: `Join Pending`,
    successText: 'Join Success',
    errorText: 'Join Error',
    chainId,
    pendingDescription: `Joining Poll ${pollId}`,
    successDescription: `Successfully Joined ${pollId}. You can now cast your vote`,
    onSuccess: onTransactionSuccess,
  });

  const joinPoll = useCallback(async (
    zkProof: string[], 
    stateRootIndex: number, 
    userPubKey: PubKey
  ) => {
    if (!nullifier) {
      throw new Error('User keypair not available');
    }
    
    await sendTransactionAsync({
      account: address!,
      to: poll,
      data: encodeFunctionData({
        abi: pollAbi,
        functionName: 'joinPoll',
        args: [
          nullifier,                    // bytes32 nullifier
          userPubKey.asContractParam(),               // uint256[2] userMaciPublicKey  
          BigInt(stateRootIndex),      // uint256 currentStateRootIndex
          zkProof,                     // uint256[8] proof
          DEFAULT_SIGNUP_POLICY_DATA,  // bytes sgDataArg
          DEFAULT_IVCP_DATA,           // bytes ivcpDataArg
        ],
      }),
      chainId,
    });
  }, [address, poll, nullifier, sendTransactionAsync, chainId]);

  return {
    hasJoined,
    nullifier,
    joinPoll,
    isConfirming,
    isConfirmed,
    refresh,
  };
}