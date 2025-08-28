import { Address, encodeFunctionData } from 'viem';
import { useReadContract, useAccount } from 'wagmi';
import { pollAbi } from '@/abis/poll';
import { SupportedNetworks } from '@/utils/networks';
import { Keypair, PubKey } from '@maci-protocol/domainobjs';
import { poseidon } from '@maci-protocol/crypto';
import { useTransactionWithToast } from './useTransactionWithToast';
import { useCallback } from 'react';
import { DEFAULT_IVCP_DATA, DEFAULT_SIGNUP_POLICY_DATA } from '@/lib/maci';

type PollUserStatsHookResult = {
  hasJoined: boolean;
  nullifier: bigint | null;
  joinPoll: (zkProof: string[], stateRootIndex: number, userPublicKey: PubKey) => Promise<void>;
};

type Props = {
  poll: Address;
  pollId: bigint;
  keyPair: Keypair | null;
  refetchInterval?: number;
  chainId?: SupportedNetworks;
}

export function usePollUserStats({
  poll,
  pollId,
  keyPair,
  chainId = SupportedNetworks.BaseSepolia,
  refetchInterval = 10000,
}: Props): PollUserStatsHookResult {
  
  const { address } = useAccount();
  
  const nullifier = keyPair ? poseidon([BigInt(keyPair.privKey.asCircuitInputs()), BigInt(pollId)]) : null;

  // Read start and end dates
  const { data: hasJoined } = useReadContract({
    abi: pollAbi,
    functionName: 'pollNullifiers',
    args: [nullifier],
    address: poll,
    query: {
      enabled: !!poll && !!nullifier,
      refetchInterval,
    },
    chainId: chainId,
  });


  const { sendTransactionAsync } = useTransactionWithToast({
    toastId: 'join-poll',
    pendingText: `Join Pending`,
    successText: 'Join Success',
    errorText: 'Join Error',
    chainId,
    pendingDescription: `Joinining Poll ${pollId}`,
    successDescription: `Successfully Joined ${pollId}. You can now cast your vote`,
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
    hasJoined: hasJoined ? true : false,
    nullifier,
    joinPoll,
  };
}