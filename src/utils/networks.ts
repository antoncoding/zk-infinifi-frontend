export enum SupportedNetworks {
    BaseSepolia = 84532,
}

export function getNetworkImg(networkId: number): string {
  switch (networkId) {
    case SupportedNetworks.BaseSepolia:
      return '/images/networks/base.svg';
    default:
      return '/images/networks/ethereum.svg';
  }
}
  