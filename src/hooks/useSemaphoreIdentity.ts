import { useCallback, useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { useLocalStorage } from './useLocalStorage';
import { getSemaphoreConfig } from '@/config/semaphore';
import { 
  SemaphoreIdentityStorage,
  IdentityGenerationError,
  SemaphoreUserState 
} from '@/types/semaphore';

type IdentityStorageMap = Record<string, SemaphoreIdentityStorage>;

type SemaphoreIdentityHookResult = {
  userState: SemaphoreUserState;
  generateIdentity: () => Promise<Identity | null>;
  getStoredIdentity: () => Identity | null;
  getStoredSignature: () => string | null;
  clearIdentity: () => void;
  loading: boolean;
  error: IdentityGenerationError | null;
  isSigningMessage: boolean;
};

/**
 * Hook to manage Semaphore identities for users
 * Generates deterministic identities from wallet signatures
 */
export function useSemaphoreIdentity(): SemaphoreIdentityHookResult {
  const { address } = useAccount();
  const { signMessageAsync, isPending: isSigningMessage } = useSignMessage();
  const [identityStorage, setIdentityStorage] = useLocalStorage<IdentityStorageMap>(
    'semaphoreIdentityStorage', 
    {}
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<IdentityGenerationError | null>(null);
  const [userState, setUserState] = useState<SemaphoreUserState>({
    hasIdentity: false,
    isGroupMember: false, // Will be updated by other hooks
    hasVoted: false, // Will be updated by other hooks
  });

  const config = getSemaphoreConfig();

  // Get stored identity for current wallet
  const getStoredIdentity = useCallback((): Identity | null => {
    if (!address) return null;
    
    try {
      const normalizedAddress = address.toLowerCase();
      const storedData = identityStorage[normalizedAddress];
      
      if (!storedData) return null;
      
      // Recreate identity from stored private key
      const identity = new Identity(storedData.privateKey);
      return identity;
    } catch (err) {
      console.error('Error retrieving stored identity:', err);
      return null;
    }
  }, [address, identityStorage]);

  // Get stored signature for current wallet
  const getStoredSignature = useCallback((): string | null => {
    if (!address) return null;
    
    try {
      const normalizedAddress = address.toLowerCase();
      const storedData = identityStorage[normalizedAddress];
      
      return storedData?.signature ?? null;
    } catch (err) {
      console.error('Error retrieving stored signature:', err);
      return null;
    }
  }, [address, identityStorage]);

  // Generate new identity from wallet signature
  const generateIdentity = useCallback(async (): Promise<Identity | null> => {
    if (!address) {
      setError({
        type: 'WALLET_NOT_CONNECTED',
        message: 'Please connect your wallet first'
      });
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if identity already exists
      const existingIdentity = getStoredIdentity();
      if (existingIdentity) {
        setUserState(prev => ({
          ...prev,
          hasIdentity: true,
          identity: existingIdentity,
          commitment: existingIdentity.commitment.toString(),
        }));
        return existingIdentity;
      }

      // Request signature from user
      const signature = await signMessageAsync({
        message: config.appSignatureMessage,
        account: address,
      });

      // Generate deterministic identity from signature
      const identity = new Identity(signature);
      
      // Store identity data with signature
      const normalizedAddress = address.toLowerCase();
      const identityData: SemaphoreIdentityStorage = {
        privateKey: identity.privateKey.toString(),
        commitment: identity.commitment.toString(),
        signature: signature, // Store the signature for reuse
      };

      setIdentityStorage(prev => ({
        ...prev,
        [normalizedAddress]: identityData,
      }));

      // Update user state
      setUserState(prev => ({
        ...prev,
        hasIdentity: true,
        identity,
        commitment: identity.commitment.toString(),
      }));

      return identity;

    } catch (err) {
      let errorType: IdentityGenerationError['type'] = 'IDENTITY_GENERATION_FAILED';
      let errorMessage = 'Failed to generate identity';

      if (err instanceof Error) {
        if (err.message.includes('User rejected') || err.message.includes('user denied')) {
          errorType = 'SIGNATURE_REJECTED';
          errorMessage = 'You must sign the message to generate your anonymous identity';
        } else {
          errorMessage = err.message;
        }
      }

      setError({ type: errorType, message: errorMessage });
      console.error('Error generating Semaphore identity:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, signMessageAsync, config.appSignatureMessage, getStoredIdentity, setIdentityStorage]);

  // Clear stored identity
  const clearIdentity = useCallback(() => {
    if (!address) return;

    const normalizedAddress = address.toLowerCase();
    setIdentityStorage(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [normalizedAddress]: _, ...remaining } = prev;
      return remaining;
    });

    setUserState({
      hasIdentity: false,
      isGroupMember: false,
      hasVoted: false,
    });
  }, [address, setIdentityStorage]);

  // Check for existing identity on mount and address change
  useEffect(() => {
    if (!address) {
      setUserState({
        hasIdentity: false,
        isGroupMember: false,
        hasVoted: false,
      });
      return;
    }

    const existingIdentity = getStoredIdentity();
    if (existingIdentity) {
      setUserState(prev => ({
        ...prev,
        hasIdentity: true,
        identity: existingIdentity,
        commitment: existingIdentity.commitment.toString(),
      }));
    } else {
      setUserState(prev => ({
        ...prev,
        hasIdentity: false,
        identity: undefined,
        commitment: undefined,
      }));
    }
  }, [address, getStoredIdentity]);

  return {
    userState,
    generateIdentity,
    getStoredIdentity,
    getStoredSignature,
    clearIdentity,
    loading,
    error,
    isSigningMessage,
  };
}