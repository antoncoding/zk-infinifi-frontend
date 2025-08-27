import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { useLocalStorage } from './useLocalStorage';
import { Keypair, PrivKey } from "@maci-protocol/domainobjs";

// typing for the MACI key in storage
type MACIStorageKeyPair = {
  publicKey: string;
  privateKey: string;
};

type MACIKeyStorage = Record<string, Record<string, MACIStorageKeyPair>>;

/**
 * Hook to manage MACI keys for users
 * Supports multiple wallets and multiple MACI contracts
 */
export function useUserMACIKey() {
  const { address } = useAccount();
  const [maciKeyStorage, setMACIKeyStorage] = useLocalStorage<MACIKeyStorage>('maciKeyStorage', {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getMACIKeys = useCallback((maciContract: Address, userAddress?: Address): Keypair | null => {
    try {
      setError(null);
      const walletAddr = userAddress ?? address;
      
      if (!walletAddr) {
        setError(new Error('No wallet address provided'));
        return null;
      }

      const normalizedWallet = walletAddr.toLowerCase();
      const normalizedMaci = maciContract.toLowerCase();
      
      const keysInStorage = maciKeyStorage[normalizedWallet]?.[normalizedMaci] ?? null;
      if (!keysInStorage) {
        return null;
      }

      const keypair = new Keypair(PrivKey.deserialize(keysInStorage.privateKey));
      return keypair;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get MACI keys');
      setError(error);
      console.error('Error getting MACI keys:', error);
      return null;
    }
  }, [address, maciKeyStorage]);

  const createMACIKey = useCallback(async (maciContract: Address, userAddress?: Address): Promise<Keypair | null> => {
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
      const keypair = new Keypair();
      const keyPairInStorage: MACIStorageKeyPair = {
        publicKey: keypair.pubKey.serialize(),
        privateKey: keypair.privKey.serialize(),
      };

      // Store the new key
      setMACIKeyStorage(prev => ({
        ...prev,
        [normalizedWallet]: {
          ...prev[normalizedWallet],
          [normalizedMaci]: keyPairInStorage,
        },
      }));

      return keypair;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create MACI key');
      setError(error);
      console.error('Error creating MACI key:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, getMACIKeys, setMACIKeyStorage]);

  const getAllKeysForUser = useCallback((userAddress?: Address): Record<string, MACIStorageKeyPair> => {
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [normalizedMaci]: _, ...remainingKeys } = prev[normalizedWallet];
        
        if (Object.keys(remainingKeys).length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [normalizedWallet]: __, ...remainingWallets } = prev;
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
