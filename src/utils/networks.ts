export enum SupportedNetworks {
    Mainnet = 1,
    Base = 8453,
    Polygon = 137,
    Unichain = 130,
}

export function getNetworkImg(networkId: number): string {
  switch (networkId) {
    case SupportedNetworks.Mainnet:
      return '/images/networks/ethereum.svg';
    case SupportedNetworks.Base:
      return '/images/networks/base.svg';
    case SupportedNetworks.Polygon:
      return '/images/networks/polygon.svg';
    case SupportedNetworks.Unichain:
      return '/images/networks/unichain.svg';
    default:
      return '/images/networks/ethereum.svg';
  }
}
  