import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { useLocalStorage } from './useLocalStorage';
import { genKeypair } from '@maci-protocol/crypto';

type MACIKey = {
  publicKey: string;
  privateKey: string;
};

type MACIKeyStorage = {
  [walletAddress: string]: {
    [maciContract: string]: MACIKey;
  };
};

/**
 * Hook to manage MACI keys for users
 * Supports multiple wallets and multiple MACI contracts
 */
export function useUserMACIKey() {
  const { address } = useAccount();
  const [maciKeyStorage, setMACIKeyStorage] = useLocalStorage<MACIKeyStorage>('maciKeyStorage', {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getMACIKeys = useCallback((maciContract: Address, userAddress?: Address): MACIKey | null => {
    try {
      setError(null);
      const walletAddr = userAddress ?? address;
      
      if (!walletAddr) {
        setError(new Error('No wallet address provided'));
        return null;
      }

      const normalizedWallet = walletAddr.toLowerCase();
      const normalizedMaci = maciContract.toLowerCase();
      
      return maciKeyStorage[normalizedWallet]?.[normalizedMaci] ?? null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get MACI keys');
      setError(error);
      console.error('Error getting MACI keys:', error);
      return null;
    }
  }, [address, maciKeyStorage]);

  const createMACIKey = useCallback(async (maciContract: Address, userAddress?: Address): Promise<MACIKey | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const walletAddr = userAddress ?? address;
      
      if (!walletAddr) {
        throw new Error('No wallet address provided');
      }

      const normalizedWallet = walletAddr.toLowerCase();
      const normalizedMaci = maciContract.toLowerCase();

      // Check if key already exists
      const existingKey = getMACIKeys(maciContract, userAddress);
      if (existingKey) {
        return existingKey;
      }

      // Generate new keypair
      const keypair = genKeypair();
      const newKey: MACIKey = {
        publicKey: keypair.pubKey.toString(),
        privateKey: keypair.privKey.toString(),
      };

      // Store the new key
      setMACIKeyStorage(prev => ({
        ...prev,
        [normalizedWallet]: {
          ...prev[normalizedWallet],
          [normalizedMaci]: newKey,
        },
      }));

      return newKey;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create MACI key');
      setError(error);
      console.error('Error creating MACI key:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, getMACIKeys, setMACIKeyStorage]);

  const getAllKeysForUser = useCallback((userAddress?: Address): Record<string, MACIKey> => {
    try {
      setError(null);
      const walletAddr = userAddress ?? address;
      
      if (!walletAddr) {
        setError(new Error('No wallet address provided'));
        return {};
      }

      const normalizedWallet = walletAddr.toLowerCase();
      return maciKeyStorage[normalizedWallet] ?? {};
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get all keys for user');
      setError(error);
      console.error('Error getting all keys for user:', error);
      return {};
    }
  }, [address, maciKeyStorage]);

  const removeKey = useCallback((maciContract: Address, userAddress?: Address): boolean => {
    try {
      setError(null);
      const walletAddr = userAddress ?? address;
      
      if (!walletAddr) {
        setError(new Error('No wallet address provided'));
        return false;
      }

      const normalizedWallet = walletAddr.toLowerCase();
      const normalizedMaci = maciContract.toLowerCase();

      setMACIKeyStorage(prev => {
        if (!prev[normalizedWallet]?.[normalizedMaci]) {
          return prev;
        }

        const { [normalizedMaci]: removed, ...remainingKeys } = prev[normalizedWallet];
        
        if (Object.keys(remainingKeys).length === 0) {
          const { [normalizedWallet]: removedWallet, ...remainingWallets } = prev;
          return remainingWallets;
        }

        return {
          ...prev,
          [normalizedWallet]: remainingKeys,
        };
      });

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove MACI key');
      setError(error);
      console.error('Error removing MACI key:', error);
      return false;
    }
  }, [address, setMACIKeyStorage]);

  return {
    getMACIKeys,
    createMACIKey,
    getAllKeysForUser,
    removeKey,
    loading,
    error,
  };
}
