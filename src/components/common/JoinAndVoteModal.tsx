'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { poseidon } from "@maci-protocol/crypto";
import { Poll } from '@/config/poll';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Shield, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { downloadPollJoiningArtifactsBrowser } from '@/lib/maci';
import { getMaciAddress, getMaciConfig } from '@/config/poll';
import { useUserMACIKey } from '@/hooks/useUserMACIKey';
import { Signer } from 'ethers';
import { usePollUserStats } from '@/hooks/usePollUserStats';

const maciAddress = getMaciAddress();

type JoinAndVoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  poll: Poll;
};

const STEPS = [
  { id: 'downloading', title: 'Download Artifacts', description: 'Download zk-SNARK artifacts for joining', icon: Download, label: 'Download' },
  { id: 'generating', title: 'Generate Proof', description: 'Generate cryptographic proof to join poll', icon: Shield, label: 'Generate' },
  { id: 'submitting', title: 'Submit Transaction', description: 'Submit join transaction to blockchain', icon: Send, label: 'Submit' },
  { id: 'done', title: 'Joined Successfully!', description: 'Ready to cast your vote', icon: CheckCircle, label: 'Complete' }
];

export function JoinAndVoteModal({ isOpen, onClose, poll }: JoinAndVoteModalProps) {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadedArtifacts, setDownloadedArtifacts] = useState<{zKey: Uint8Array, wasm: Uint8Array} | null>(null);

  const { getMACIKeys } = useUserMACIKey();
  
  const maciConfig = getMaciConfig();

  const userKeyPair = useMemo(() => {
    return getMACIKeys(maciAddress, address)
  }, [getMACIKeys, maciAddress, address])

  const { hasJoined, nullifier } = usePollUserStats({
    poll: poll.pollContract,
    pollId: BigInt(poll.id),
    keyPair: userKeyPair,
  });

  console.log("hasJoined", hasJoined, nullifier)

  // Check if user has already joined the poll
  useEffect(() => {
    async function checkUserJoined() {
      if (!isConnected || !address || !isOpen) return;

      try {
        if (hasJoined) {
          setCurrentStep(3); // Skip to final step if already joined
        } else {
          setCurrentStep(0); // Start from beginning
        }
      } catch (error) {
        console.error('Failed to check user join status:', error);
        // Don't show error for this check, just proceed with join flow
        setCurrentStep(0);
      }
    }

    if (isOpen) {
      void checkUserJoined();
      setError(null);
    }
  }, [isConnected, address, isOpen, hasJoined]);

  const handleDownloadArtifacts = async () => {
    if (!address) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      // Download artifacts directly
      const artifacts = await downloadPollJoiningArtifactsBrowser({
        testing: maciConfig.testing,
        stateTreeDepth: maciConfig.stateTreeDepth,
      });
      
      setDownloadedArtifacts(artifacts);
      setCurrentStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download artifacts');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateProof = async () => {
    if (!address) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      // Simulate proof generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate proof');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!address) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      // Simulate transaction submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep(3);
    } catch (err) {
      // Handle different types of errors
      let errorMessage = 'Failed to submit transaction';
      
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
      console.error('Join transaction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setTimeout(() => {
        setCurrentStep(0);
        setError(null);
        setDownloadedArtifacts(null);
      }, 200);
    }
  };

  const handleDone = () => {
    handleClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Download className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-secondary-foreground">Download Artifacts</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Download the required zk-SNARK artifacts for generating proofs. These files enable secure and private voting.
              </p>
            </div>
            <Button
              onClick={() => void handleDownloadArtifacts()}
              disabled={isProcessing}
              className="w-full rounded-sm"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading artifacts...
                </>
              ) : (
                'Download Artifacts'
              )}
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-secondary-foreground">Generate Proof</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Generate a cryptographic proof that verifies your eligibility to join this poll without revealing your identity.
              </p>
              {downloadedArtifacts && (
                <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 inline-block">
                  ✓ Using {Object.keys(downloadedArtifacts).length} artifact files
                </div>
              )}
            </div>
            <Button
              onClick={() => void handleGenerateProof()}
              disabled={isProcessing}
              className="w-full rounded-sm"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Proof...
                </>
              ) : (
                'Generate Proof'
              )}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Send className="h-8 w-8 text-orange-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-secondary-foreground">Submit Transaction</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Submit your join transaction to the blockchain with your cryptographic proof.
              </p>
            </div>
            <Button
              onClick={() => void handleSubmitTransaction()}
              disabled={isProcessing}
              className="w-full rounded-sm"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Transaction...
                </>
              ) : (
                'Submit Transaction'
              )}
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-green-700">Joined Successfully!</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                🎉 You have successfully joined {poll.name ? `"${poll.name}"` : `Poll #${poll.id}`}! You can now cast your vote securely and privately.
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
          {currentStep < 3 && (
            <div className="flex-shrink-0 px-6 pb-6 pt-2 border-t border-muted">
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isProcessing}
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

export default JoinAndVoteModal;