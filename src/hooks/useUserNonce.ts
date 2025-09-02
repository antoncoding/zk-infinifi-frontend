import { useCallback } from 'react';
import { Address } from 'viem';

type UserNonceData = Record<string, bigint>;

type AddressNonceData = Record<string, UserNonceData>;

const NONCE_STORAGE_KEY = 'maci_user_nonces';

export function useUserNonce() {
  const getNonces = useCallback((): AddressNonceData => {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(NONCE_STORAGE_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored) as Record<string, Record<string, string>>;
      // Convert string values back to bigint
      const converted: AddressNonceData = {};
      for (const [address, pollData] of Object.entries(parsed)) {
        converted[address] = {};
        for (const [pollId, nonce] of Object.entries(pollData)) {
          converted[address][pollId] = BigInt(nonce);
        }
      }
      return converted;
    } catch (error) {
      console.error('Failed to parse stored nonces:', error);
      return {};
    }
  }, []);

  const setNonces = useCallback((nonces: AddressNonceData) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Convert bigint values to string for storage
      const toStore: Record<string, Record<string, string>> = {};
      for (const [address, pollData] of Object.entries(nonces)) {
        toStore[address] = {};
        for (const [pollId, nonce] of Object.entries(pollData)) {
          toStore[address][pollId] = nonce.toString();
        }
      }
      localStorage.setItem(NONCE_STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to store nonces:', error);
    }
  }, []);

  const getUserNonce = useCallback((address: Address, pollId: bigint): bigint => {
    const nonces = getNonces();
    const pollIdStr = pollId.toString();
    return nonces[address]?.[pollIdStr] ?? 1n; // Start with nonce 1
  }, [getNonces]);

  const incrementUserNonce = useCallback((address: Address, pollId: bigint) => {
    const nonces = getNonces();
    const pollIdStr = pollId.toString();
    
    if (!nonces[address]) {
      nonces[address] = {};
    }
    
    const currentNonce = nonces[address][pollIdStr] ?? 1n;
    nonces[address][pollIdStr] = currentNonce + 1n;
    
    setNonces(nonces);
    return nonces[address][pollIdStr];
  }, [getNonces, setNonces]);

  const resetUserNonce = useCallback((address: Address, pollId: bigint) => {
    const nonces = getNonces();
    const pollIdStr = pollId.toString();
    
    if (!nonces[address]) {
      nonces[address] = {};
    }
    
    nonces[address][pollIdStr] = 1n;
    setNonces(nonces);
  }, [getNonces, setNonces]);

  return {
    getUserNonce,
    incrementUserNonce,
    resetUserNonce,
  };
}