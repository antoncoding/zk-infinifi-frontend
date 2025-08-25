import React from 'react';
import { Address } from 'viem';
import { getExplorerURL } from '@/utils/external';
import { SupportedNetworks } from '@/utils/networks';

type AddressBadgeProps = {
  address: Address;
  chainId?: SupportedNetworks;
  className?: string;
};

export function AddressBadge({
  address,
  chainId = SupportedNetworks.BaseSepolia,
  className = '',
}: AddressBadgeProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleClick = () => {
    const explorerUrl = getExplorerURL(address, chainId);
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground border transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${className}`}
      title={`View ${address} on explorer`}
    >
      {formatAddress(address)}
    </button>
  );
}

export default AddressBadge;