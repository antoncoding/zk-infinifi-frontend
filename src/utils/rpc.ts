import { createPublicClient, http } from 'viem';
import { base, mainnet, polygon, unichain } from 'viem/chains';
import { SupportedNetworks } from './networks';

// Initialize Alchemy clients for each chain
export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

export const baseClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

export const polygonClient = createPublicClient({
  chain: polygon,
  transport: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

export const unichainClient = createPublicClient({
  chain: unichain,
  transport: http(`https://unichain-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

export const getClient = (chainId: SupportedNetworks) => {
  switch (chainId) {
    case SupportedNetworks.Mainnet:
      return mainnetClient;
    case SupportedNetworks.Base:
      return baseClient;
    case SupportedNetworks.Polygon:
      return polygonClient;
    case SupportedNetworks.Unichain:
      return unichainClient;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};
