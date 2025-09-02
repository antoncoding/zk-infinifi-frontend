import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { pollAbi } from '@/abis/poll';
import { SupportedNetworks } from '@/utils/networks';
import { PubKey } from '@maci-protocol/domainobjs';
import { poseidon } from '@maci-protocol/crypto';
import { Keypair } from '@maci-protocol/domainobjs';

type SharedPollData = {
  // User status
  hasJoined: boolean;
  nullifier: bigint | null;
  
  // Coordinator data
  coordinatorPublicKey: PubKey | undefined;
  
  // Vote options (frequently needed)
  voteOptions: bigint;
  
  // Loading state
  isLoading: boolean;
  
  // Refresh function
  refresh: (() => Promise<unknown>) | undefined;
};

type Props = {
  poll: Address;
  pollId: bigint;
  keyPair: Keypair | null;
  refetchInterval?: number;
  chainId?: SupportedNetworks;
}

export function usePollSharedData({
  poll,
  pollId,
  keyPair,
  chainId = SupportedNetworks.BaseSepolia,
  refetchInterval = 30000, // Increased to 30 seconds to reduce RPC load
}: Props): SharedPollData {
  
  const nullifier = keyPair ? poseidon([BigInt(keyPair.privKey.asCircuitInputs()), BigInt(pollId)]) : null;

  // Single call to check if user has joined the poll
  const { data: hasJoined, refetch: refetchHasJoined } = useReadContract({
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

  // Single call to get coordinator public key
  const { data: coordinatorPublicKeys } = useReadContract({
    abi: pollAbi,
    functionName: 'coordinatorPublicKey',
    address: poll,
    query: {
      enabled: !!poll,
      refetchInterval,
    },
    chainId,
  });

  // Single call to get vote options
  const { data: voteOptions } = useReadContract({
    abi: pollAbi,
    functionName: 'voteOptions',
    address: poll,
    query: {
      enabled: !!poll,
      refetchInterval,
    },
    chainId,
  });

  const isLoading = hasJoined === undefined || coordinatorPublicKeys === undefined || voteOptions === undefined;

  return {
    hasJoined: hasJoined ? true : false,
    nullifier,
    coordinatorPublicKey: coordinatorPublicKeys ? new PubKey(coordinatorPublicKeys as [bigint, bigint]) : undefined,
    voteOptions: (voteOptions ?? BigInt(0)) as bigint,
    isLoading,
    refresh: refetchHasJoined,
  };
}