import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { abi as maciAbi } from '@/abis/maci';
import { SupportedNetworks } from '@/utils/networks';
import { Keypair } from '@maci-protocol/domainobjs';

type MACIUserStatsHookResult = {
  stateIndex: bigint | null;
  stateTreeDepth: bigint | null;
  totalSignups: bigint | null;
  isLoading: boolean;
};

type Props = {
  maci: Address;
  keyPair: Keypair | null;
  refetchInterval?: number;
  chainId?: SupportedNetworks;
}

export function useMaciUserStats({
  maci,
  keyPair,
  chainId = SupportedNetworks.BaseSepolia,
  refetchInterval = 10000,
}: Props): MACIUserStatsHookResult {

  // Get the public key hash for the keyPair
  const publicKeyHash = keyPair ? keyPair.pubKey.hash() : null;

  // Read state index for the user's public key
  const { data: stateIndex } = useReadContract({
    abi: maciAbi,
    functionName: 'getStateIndex',
    args: [publicKeyHash],
    address: maci,
    query: {
      enabled: !!maci && !!publicKeyHash,
      refetchInterval,
    },
    chainId,
  });

  // Read state tree depth
  const { data: stateTreeDepth } = useReadContract({
    abi: maciAbi,
    functionName: 'stateTreeDepth',
    address: maci,
    query: {
      enabled: !!maci,
      refetchInterval,
    },
    chainId,
  });

  // Read total signups
  const { data: totalSignups } = useReadContract({
    abi: maciAbi,
    functionName: 'totalSignups',
    address: maci,
    query: {
      enabled: !!maci,
      refetchInterval,
    },
    chainId,
  });

  const isLoading = stateTreeDepth === undefined || totalSignups === undefined;

  return {
    stateIndex: (stateIndex as bigint) ?? null,
    stateTreeDepth: (stateTreeDepth as bigint) ?? null,
    totalSignups: (totalSignups as bigint) ?? null,
    isLoading,
  };
}