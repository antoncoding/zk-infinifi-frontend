import React, { useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { useTokens } from '@/components/providers/TokenProvider';
import { TooltipContent as CustomTooltipContent } from './TooltipContent';
type TokenIconProps = {
  address: string;
  chainId: number;
  width: number;
  height: number;
  opacity?: number;
  symbol?: string;
};

export function TokenIcon({ address, chainId, width, height, opacity }: TokenIconProps) {
  const { findToken } = useTokens();

  const token = useMemo(() => findToken(address, chainId), [address, chainId, findToken]);

  // If we have a token with an image, use that
  if (token?.img) {
    const img = (
      <Image
        className="rounded-full"
        src={token.img}
        alt={token.symbol}
        width={width}
        height={height}
      />
    );

    const detail = token.isFactoryToken
      ? `This token is auto-detected from ${token.protocol?.name} `
      : `This token is verified`;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Image
              className="rounded-full"
              src={token.img}
              alt={token.symbol}
              width={width}
              height={height}
              style={{ opacity }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <CustomTooltipContent title={token.symbol} detail={detail} icon={img} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Fallback to placeholder
  return <div className="rounded-full bg-gray-300 dark:bg-gray-700" style={{ width, height }} />;
}
