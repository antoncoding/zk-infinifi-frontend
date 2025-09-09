'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Send, Users, AlertCircle, Loader2 } from 'lucide-react';
import { getSemaphoreConfig } from '@/config/semaphore';

const STEPS = [
  { id: 'identity', title: 'Generate Identity', description: 'Create anonymous identity with wallet signature', icon: Shield, label: 'Identity' },
  { id: 'joining', title: 'Join Group', description: 'Backend will add you to the voting group', icon: Users, label: 'Join' }
];

type SemaphoreJoinModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess?: () => void;
  userIdentity?: Identity;
  onJoinGroup?: (identity: Identity, signature: string) => Promise<boolean>;
};

export function SemaphoreJoinModal({ 
  isOpen, 
  onClose, 
  onJoinSuccess,
  userIdentity,
  onJoinGroup 
}: SemaphoreJoinModalProps) {
  const { address } = useAccount();
  const { signMessageAsync, isPending: isSigningMessage } = useSignMessage();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const config = getSemaphoreConfig();

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(userIdentity ? 1 : 0);
      setError(null);
      setSignature(null);
    }
  }, [isOpen, userIdentity]);

  const handleSignMessage = async () => {
    if (!address) return;

    try {
      setError(null);
      setIsProcessing(true);

      const messageSignature = await signMessageAsync({
        message: config.appSignatureMessage,
        account: address,
      });

      setSignature(messageSignature);
      setCurrentStep(1);
    } catch (err) {
      let errorMessage = 'Failed to sign message';
      
      if (err instanceof Error) {
        if (err.message.includes('User rejected') || err.message.includes('user denied')) {
          errorMessage = 'You must sign the message to join the group';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!userIdentity ?? !signature ?? !onJoinGroup) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      const success = await onJoinGroup(userIdentity!, signature);
      
      if (success) {
        onJoinSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !isSigningMessage) {
      onClose();
      setTimeout(() => {
        setCurrentStep(userIdentity ? 1 : 0);
        setError(null);
        setSignature(null);
      }, 200);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-secondary-foreground">Generate Identity</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sign a message with your wallet to create an anonymous identity. This identity will be used for private voting.
              </p>
              <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mt-4">
                <p className="font-medium mb-1">Privacy Note:</p>
                <p>Your wallet signature creates a unique anonymous identity. This identity cannot be linked back to your wallet address.</p>
              </div>
            </div>
            <Button
              onClick={() => void handleSignMessage()}
              disabled={isProcessing ?? isSigningMessage}
              className="w-full rounded-sm"
              size="lg"
            >
              {isSigningMessage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sign Message...
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign Message
                </>
              )}
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-secondary-foreground">Join Voting Group</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Join the anonymous voting group. Our backend will verify your signature and add your identity commitment to the group.
              </p>
              {userIdentity && (
                <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-md px-2 py-1 inline-block">
                  ✓ Identity ready: {userIdentity.commitment.toString().slice(0, 8)}...
                </div>
              )}
              <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mt-3">
                <p className="font-medium mb-1">Group Membership:</p>
                <p>Once added, you'll be able to vote anonymously using zero-knowledge proofs.</p>
              </div>
            </div>
            <Button
              onClick={() => void handleJoinGroup()}
              disabled={isProcessing ?? !userIdentity ?? !signature}
              className="w-full rounded-sm"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining Group...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Join Group
                </>
              )}
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
              {/* Step Content */}
              <div className="min-h-[350px] flex items-center justify-center">
                {renderStepContent()}
              </div>

              {/* Error Display */}
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
          <div className="flex-shrink-0 px-6 pb-6 pt-2 border-t border-muted">
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isProcessing ?? isSigningMessage}
                className="text-muted-foreground hover:text-secondary-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}