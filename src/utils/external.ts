import { SupportedNetworks } from './networks';

export const getMarketURL = (id: string, chainId: number): string => {
  const chain = chainId === 1 ? 'mainnet' : 'base';
  return `https://app.morpho.org/market?id=${id}&network=${chain}`;
};

export const getAssetURL = (address: string, chain: SupportedNetworks): string => {
  switch (chain) {
    case SupportedNetworks.BaseSepolia:
      return `https://sepolia.basescan.org/token/${address}`;
  }
};

export const getExplorerURL = (address: string, chain: SupportedNetworks): string => {
  switch (chain) {
    case SupportedNetworks.BaseSepolia:
      return `https://sepolia.basescan.org/address/${address}`;
  }
};

export const getExplorerTxURL = (hash: string, chain: SupportedNetworks): string => {
  switch (chain) {
    case SupportedNetworks.BaseSepolia:
      return `https://sepolia.basescan.org/tx/${hash}`;
  }
};

