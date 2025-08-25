import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { SupportedNetworks } from './networks';

// Initialize Alchemy clients for each chain
export const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(`https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

export const getClient = (chainId: SupportedNetworks) => {
  switch (chainId) {
    case SupportedNetworks.BaseSepolia:
      return sepoliaClient;
  }
};
