import { useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { useUserMACIKey } from './useUserMACIKey';
import { getMaciAddress } from '@/config/poll';
import { isUserRegisteredOnMaci } from '@/lib/maci';
import { useTransactionWithToast } from './useTransactionWithToast';
import { abi as maciAbi } from '@/abis/maci';
import { baseSepolia } from 'viem/chains';

type MACIRegistrationStatus = {
  hasKey: boolean;
  isRegisteredOnContract: boolean;
  isFullyRegistered: boolean; // has key AND submitted registration
  loading: boolean;
  error: Error | null;
};

export function useMACIRegistration() {
  const { address } = useAccount();

  const targetChain = baseSepolia;

  const { getMACIKeys, createMACIKey } = useUserMACIKey();
  const [status, setStatus] = useState<MACIRegistrationStatus>({
    hasKey: false,
    isRegisteredOnContract: false,
    isFullyRegistered: false,
    loading: false,
    error: null,
  });

  const maciContract = getMaciAddress();

  const { sendTransactionAsync, isConfirming: registrationPending } = useTransactionWithToast({
    toastId: 'maci-registration',
    pendingText: 'Registering with MACI...',
    successText: 'Successfully registered with MACI',
    errorText: 'Registration failed',
    chainId: targetChain.id,
    pendingDescription: 'Submitting your public key to MACI contract...',
    successDescription: 'You can now participate in polls!',
  });

  const checkRegistrationStatus = useCallback(async () => {
    if (!address) {
      setStatus({
        hasKey: false,
        isRegisteredOnContract: false,
        isFullyRegistered: false,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      const maciKey = getMACIKeys(maciContract, address);
      const hasKey = !!maciKey;

      let isRegisteredOnContract = false;
      if (hasKey && maciKey) {
        try {
          // Get the public key coordinates for subgraph query
          const pubKeyParams = maciKey.pubKey.asContractParam();
          isRegisteredOnContract = await isUserRegisteredOnMaci(
            BigInt(pubKeyParams.x), 
            BigInt(pubKeyParams.y)
          );
        } catch (err) {
          console.warn('Failed to check contract registration status:', err);
          isRegisteredOnContract = false;
        }
      }

      const isFullyRegistered = hasKey && isRegisteredOnContract;

      setStatus({
        hasKey,
        isRegisteredOnContract,
        isFullyRegistered,
        loading: false,
        error: null,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check registration status');
      setStatus(prev => ({
        ...prev,
        loading: false,
        error,
      }));
      console.error('Error checking MACI registration status:', error);
    }
  }, [address, getMACIKeys, maciContract]);

  const signUp = useCallback(async () => {
    if (!address) throw new Error('No wallet connected');

    try {
      setStatus(prev => ({ ...prev, error: null }));

      // Get or create MACI key
      let maciKey = getMACIKeys(maciContract, address);
      if (!maciKey) {
        maciKey = await createMACIKey(maciContract, address);
        if (!maciKey) throw new Error('Failed to create MACI key');
      }

      // Prepare transaction data
      const txData = encodeFunctionData({
        abi: maciAbi,
        functionName: 'signUp',
        args: [
          maciKey.pubKey.asContractParam(),
          '0x', // _signUpPolicyData 
        ],
      });

      // Send transaction
      await sendTransactionAsync({
        account: address,
        to: maciContract,
        data: txData,
        chainId: targetChain.id
      });

      // Refresh status after successful registration
      await checkRegistrationStatus();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to register with MACI');
      setStatus(prev => ({ ...prev, error }));
      console.error('Error during MACI registration:', error);
      throw error;
    }
  }, [address, getMACIKeys, createMACIKey, maciContract, sendTransactionAsync, checkRegistrationStatus, targetChain.id]);

  useEffect(() => {
    void checkRegistrationStatus();
  }, [checkRegistrationStatus]);

  const refresh = useCallback(() => {
    void checkRegistrationStatus();
  }, [checkRegistrationStatus]);

  return {
    ...status,
    signUp,
    registrationPending,
    refresh,
  };
}