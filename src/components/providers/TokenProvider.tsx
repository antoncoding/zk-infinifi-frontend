'use client';

import React, { createContext, useContext } from 'react';

type Token = {
  address: string;
  symbol: string;
  decimals: number;
  img?: string;
  isFactoryToken?: boolean;
  protocol?: {
    name: string;
  };
};

type TokenProviderContextType = {
  findToken: (address: string, chainId: number) => Token | null;
};

const TokenProviderContext = createContext<TokenProviderContextType | null>(null);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const findToken = (): Token | null => {
    console.log('Mock findToken');

    return null;
  };

  return (
    <TokenProviderContext.Provider value={{ findToken }}>
      {children}
    </TokenProviderContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenProviderContext);
  if (!context) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
} 