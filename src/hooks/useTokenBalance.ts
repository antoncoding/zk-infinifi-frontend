import { Address, erc20Abi } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { SupportedNetworks } from '@/utils/networks';

type Props = {
  token: Address;
  user?: Address;
  refetchInterval?: number;
};

export function useTokenBalance({
  token,
  user,
  refetchInterval = 10000,
}: Props) {
  const { address } = useAccount();
  const userAddress = user ?? address;

  const { data, isLoading, refetch } = useReadContract({
    abi: erc20Abi,
    functionName: 'balanceOf',
    address: token,
    args: [userAddress!],
    chainId: SupportedNetworks.BaseSepolia,
    query: {
      enabled: !!userAddress && !!token,
      refetchInterval,
    },
  });

  const balance = data ?? BigInt(0);

  return {
    balance,
    isLoadingBalance: isLoading,
    refetchBalance: refetch
  };
}