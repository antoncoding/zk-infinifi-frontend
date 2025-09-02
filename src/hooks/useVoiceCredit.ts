import { Address } from 'viem';
import { useReadContract, useAccount } from 'wagmi';
import { initialVoiceCreditProxyAbi } from '@/abis/initialVoiceCreditProxy';
import { SupportedNetworks } from '@/utils/networks';

type VoiceCreditHookResult = {
  voiceCredits: bigint;
  isLoading: boolean;
  error: Error | null;
};

type Props = {
  proxyAddress: Address;
  refetchInterval?: number;
  chainId?: SupportedNetworks;
}

export function useVoiceCredit({
  proxyAddress,
  chainId = SupportedNetworks.BaseSepolia,
  refetchInterval = 30000, // 30 seconds to match other optimized intervals
}: Props): VoiceCreditHookResult {
  
  const { address } = useAccount();

  const { data: voiceCredits, isLoading, error } = useReadContract({
    abi: initialVoiceCreditProxyAbi,
    functionName: 'getVoiceCredits',
    args: [address ?? '0x', '0x'], // user address and empty bytes data
    address: proxyAddress,
    query: {
      enabled: !!address && !!proxyAddress && proxyAddress !== '0x',
      refetchInterval,
    },
    chainId,
  });

  return {
    voiceCredits: (voiceCredits ?? BigInt(1)) as bigint, // Default to 1 if not available
    isLoading,
    error,
  };
}