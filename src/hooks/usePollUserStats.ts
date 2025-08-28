import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { poolAbi } from '@/abis/poll';
import { SupportedNetworks } from '@/utils/networks';
import { Keypair, PubKey } from '@maci-protocol/domainobjs';
import { poseidon } from '@maci-protocol/crypto';

type PollUserStatsHookResult = {
  hasJoined: boolean;
  nullifier: bigint | null;
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

  const nullifier = keyPair ? poseidon([BigInt(keyPair.privKey.asCircuitInputs()), BigInt(pollId)]) : null;

  // Read start and end dates
  const { data: hasJoined } = useReadContract({
    abi: poolAbi,
    functionName: 'pollNullifiers',
    args: [nullifier],
    address: poll,
    query: {
      enabled: !!poll && !!nullifier,
      refetchInterval,
    },
    chainId: chainId,
  });


  // fetch again in this hook for simplicity. It's also fetched in usePoll hook
  const { data: coordinatorPublicKeys } = useReadContract({
    abi: poolAbi,
    functionName: 'coordinatorPublicKey',
    address: poll,
    query: {
      enabled: !!poll,
      refetchInterval,
    },
    chainId,
  });
 
  // calculate shared key with coordinator pub key and maci private key

  return {
    hasJoined: hasJoined ? true : false,
    nullifier,
  };
}