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
  const findToken = (_address: string, _chainId: number): Token | null => {
    // This is a placeholder implementation
    // In a real app, this would fetch from an API or use a token list
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