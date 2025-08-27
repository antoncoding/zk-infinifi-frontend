'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Key, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useMACIRegistration } from '@/hooks/useMACIRegistration';
import { useUserMACIKey } from '@/hooks/useUserMACIKey';
import { getMaciAddress } from '@/config/poll';
import { KeyBadge } from './KeyBadge';
import { baseSepolia } from 'viem/chains';

type RegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pollId: string; // Keep for backward compatibility but not used internally
  onSuccess?: () => void;
};

const STEPS = [
  { id: 'keygen', title: 'Generate Keypair', description: 'Create your secure MACI keypair', icon: Key, label: 'Key Gen' },
  { id: 'register', title: 'Registration', description: 'Submit your public key to the contract', icon: UserPlus, label: 'Registration' },
  { id: 'done', title: 'Done!', description: 'Successfully registered to vote', icon: CheckCircle, label: 'Confirm' }
];

export function RegistrationModal({ 
  isOpen, 
  onClose, 
  pollId: _pollId, // eslint-disable-line @typescript-eslint/no-unused-vars
  onSuccess 
}: RegistrationModalProps) {
  const { address, chainId } = useAccount();
  const { signUp, registrationPending, isFullyRegistered, refresh } = useMACIRegistration();
  const { getMACIKeys, createMACIKey, loading: keyLoading } = useUserMACIKey();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<ReturnType<typeof getMACIKeys>>(null);

  const { switchChainAsync } = useSwitchChain();

  const maciContract = getMaciAddress();

  // Check initial state when modal opens
  useEffect(() => {
    if (isOpen && address) {
      // Force a refresh to get the latest registration status
      refresh();
      
      const existingKey = getMACIKeys(maciContract, address);
      setGeneratedKey(existingKey);
      
      // Check registration status and set appropriate step
      if (isFullyRegistered) {
        setCurrentStep(2); // Skip to done step if already fully registered
      } else if (existingKey) {
        setCurrentStep(1); // Skip to registration step if key exists
      } else {
        setCurrentStep(0); // Start from key generation
      }
      setError(null);
    }
  }, [isOpen, address, getMACIKeys, maciContract, isFullyRegistered, refresh]);

  const handleGenerateKey = async () => {
    if (!address) return;

    try {
      setError(null);
      const key = await createMACIKey(maciContract, address);
      if (!key) throw new Error('Failed to generate MACI key');
      
      setGeneratedKey(key);
      setCurrentStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key');
    }
  };

  const handleRegister = async () => {
    if (!address || !generatedKey) return;

    try {
      setError(null);
      // check if switch chain is needed
      if (chainId !== baseSepolia.id) {
        await switchChainAsync({ chainId: baseSepolia.id });
      }

      await signUp();
      setCurrentStep(2);
      onSuccess?.();
    } catch (err) {
      // Handle different types of errors
      let errorMessage = 'Failed to register';
      
      if (err instanceof Error) {
        if (err.message.includes('User rejected') || err.message.includes('user denied')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (
          err.message.includes('current chain of the wallet') ||
          err.message.includes('does not match the chain') ||
          err.message.toLowerCase().includes('chain mismatch')
        ) {
          errorMessage = "Wrong network. Switch your wallet to the poll's network.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Registration error:', err);
    }
  };

  const handleClose = () => {
    if (!registrationPending && !keyLoading) {
      onClose();
      setTimeout(() => {
        setCurrentStep(0);
        setError(null);
        setGeneratedKey(null);
      }, 200);
    }
  };

  const handleDone = () => {
    // Trigger a refresh to ensure parent components get the latest status
    refresh();
    handleClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-secondary-foreground">Generate Keypair</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create your unique MACI keypair for secure and private voting. This keypair will be stored locally on your device.
              </p>
            </div>
            <Button
              onClick={() => void handleGenerateKey()}
              disabled={keyLoading}
              className="w-full rounded-sm"
              size="lg"
            >
              {keyLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Keypair...
                </>
              ) : (
                'Generate Keypair'
              )}
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-secondary-foreground">Registration</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Submit your public key to the MACI contract to register for voting.
              </p>
              {generatedKey && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground">Your Public Key:</p>
                  <div className="flex justify-center">
                    <KeyBadge value={generatedKey?.pubKey.serialize() ?? ''} className="max-w-full text-xs" />
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => void handleRegister()}
              disabled={registrationPending}
              className="w-full rounded-sm"
              size="lg"
            >
              {registrationPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                'Submit Registration'
              )}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-green-700">Done!</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                🎉 Successfully registered with MACI! You can now participate in polls and cast your votes securely.
              </p>
            </div>
            <Button
              onClick={handleDone}
              className="w-full rounded-sm bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Start Voting
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-lg border bg-secondary shadow-lg sm:max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Fixed Header with Progress */}
          <div className="flex-shrink-0 p-6 pb-4">
            <div className="flex justify-center items-center">
              <div className="flex items-center space-x-4">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <span className={`text-xs mt-2 transition-colors duration-300 ${
                      index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 px-6 pb-4 overflow-y-auto">
            <div className="flex flex-col">
              {/* Step Content - Fixed height to prevent jumping */}
              <div className="min-h-[300px] flex items-center justify-center">
                {renderStepContent()}
              </div>

              {/* Error Display - Fixed within content area */}
              <div className="min-h-0">
                {error && (
                  <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2 transition-all duration-300 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 flex-1">
                      <p className="font-medium">Error</p>
                      <p className="mt-1 break-words">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Footer with Cancel Button */}
          {currentStep < 2 && (
            <div className="flex-shrink-0 px-6 pb-6 pt-2 border-t border-muted">
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={registrationPending || keyLoading}
                  className="text-muted-foreground hover:text-secondary-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}