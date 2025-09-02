'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Poll } from '@/config/poll';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Shield, Send, AlertCircle, Loader2 } from 'lucide-react';
import { downloadPollJoiningArtifactsBrowser, generateJoinProof } from '@/lib/maci';
import { getMaciAddress, getMaciConfig } from '@/config/poll';
import { useUserMACIKey } from '@/hooks/useUserMACIKey';
import { usePollUserStats } from '@/hooks/usePollUserStats';
import { useMaciUserStats } from '@/hooks/useMaciUserStats';

const maciAddress = getMaciAddress();

type JoinModalProps = {
  isOpen: boolean;
  onClose: () => void;
  poll: Poll;
  onJoinSuccess?: () => void;
};

const STEPS = [
  { id: 'downloading', title: 'Download Artifacts', description: 'Download zk-SNARK artifacts for joining', icon: Download, label: 'Download' },
  { id: 'generating', title: 'Generate Proof', description: 'Generate cryptographic proof to join poll', icon: Shield, label: 'Generate' },
  { id: 'submitting', title: 'Submit Transaction', description: 'Submit join transaction to blockchain', icon: Send, label: 'Submit' }
];

export function JoinModal({ isOpen, onClose, poll, onJoinSuccess }: JoinModalProps) {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wasmUrl, setWasmUrl] = useState<string|null>(null);
  const [zkeyUrl, setZKeyUrl] = useState<string|null>(null);
  const [proofData, setProofData] = useState<{
    proof: string[];
    publicSignals: string[];
    // circuitInputs: Record<string, bigint>;
    nullifier: string;
    stateRoot: bigint;
  } | null>(null);

  const { getMACIKeys } = useUserMACIKey();
  
  const maciConfig = getMaciConfig();

  const userKeyPair = useMemo(() => {
    return getMACIKeys(maciAddress, address)
  }, [getMACIKeys, address])

  const { hasJoined, joinPoll, isConfirming } = usePollUserStats({
    poll: poll.pollContract,
    pollId: BigInt(poll.id),
    keyPair: userKeyPair,
    onTransactionSuccess: () => {
      setIsProcessing(false);
      onJoinSuccess?.();
      onClose();
    },
  });

  const { stateTreeDepth, totalSignups } = useMaciUserStats({
    maci: maciAddress,
    keyPair: userKeyPair,
  });

  // Check if user has already joined the poll
  useEffect(() => {
    if (isOpen) {
      if (hasJoined) {
        // If user has already joined, close the modal
        onClose();
      } else {
        // Start from beginning
        setCurrentStep(0);
        setError(null);
      }
    }
  }, [isConnected, address, isOpen, hasJoined, onClose]);

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

      // Assuming you have pollWasm and pollJoiningZkey as Uint8Array
      const wasmBlob = new Blob([artifacts.wasm], { type: 'application/wasm' });
      const zkeyBlob = new Blob([artifacts.zKey], { type: 'application/octet-stream' });
      
      const wasmUrl = URL.createObjectURL(wasmBlob);
      const zkeyUrl = URL.createObjectURL(zkeyBlob);

      setWasmUrl(wasmUrl)
      setZKeyUrl(zkeyUrl)

      setCurrentStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download artifacts');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateProof = async () => {
    if (!address || !userKeyPair || !wasmUrl || !zkeyUrl) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      // Generate proof using downloaded artifacts
      const generatedProof = await generateJoinProof({
        maciKeypair: userKeyPair,
        pollId: BigInt(poll.id),
        stateTreeDepth: Number(stateTreeDepth) ?? 10, // fallback to 10 if not available
        maciAddress: maciAddress,
        zkeyPath: zkeyUrl, // Use downloaded artifact blob URL
        wasmPath: wasmUrl, // Use downloaded artifact blob URL
      });
      
      console.log('Generated proof:', generatedProof);
      
      // Store proof data for transaction submission
      setProofData(generatedProof);
      
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate proof');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!address || !userKeyPair || !proofData) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      // Use the latest state root index (total signups - 1)
      const stateRootIndex = Number(totalSignups ?? 0) - 1;
      
      // Submit join transaction - don't advance to step 3 here
      // The onTransactionSuccess callback will handle that after confirmation
      await joinPoll(proofData.proof, stateRootIndex, userKeyPair.pubKey);
      
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
      setIsProcessing(false);
      console.error('Join transaction error:', err);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !isConfirming) {
      onClose();
      setTimeout(() => {
        setCurrentStep(0);
        setError(null);
        setProofData(null);
      }, 200);
    }
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
              {wasmUrl && zkeyUrl && (
                <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 inline-block">
                  ✓ Artifacts ready for proof generation
                </div>
              )}
              {(!wasmUrl || !zkeyUrl) && (
                <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-2 py-1 inline-block">
                  ⚠ Download artifacts first
                </div>
              )}
            </div>
            <Button
              onClick={() => void handleGenerateProof()}
              disabled={isProcessing || !wasmUrl || !zkeyUrl}
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
                {isConfirming 
                  ? 'Waiting for transaction confirmation on the blockchain...'
                  : 'Submit your join transaction to the blockchain with your cryptographic proof.'
                }
              </p>
            </div>
            <Button
              onClick={() => void handleSubmitTransaction()}
              disabled={isProcessing || isConfirming}
              className="w-full rounded-sm"
              size="lg"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirming Transaction...
                </>
              ) : isProcessing ? (
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
          <div className="flex-shrink-0 px-6 pb-6 pt-2 border-t border-muted">
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isProcessing || isConfirming}
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

export default JoinModal;