'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Poll } from '@/config/poll';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Vote, Send, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useUserMACIKey } from '@/hooks/useUserMACIKey';
import { useVotePoll } from '@/hooks/useVotePoll';
import { usePollSharedData } from '@/hooks/usePollSharedData';
import { getMaciAddress } from '@/config/poll';

const maciAddress = getMaciAddress();

type VoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  poll: Poll;
  onVoteSuccess?: () => void;
};

const STEPS = [
  { id: 'voting', title: 'Cast Your Vote', description: 'Choose your preferred option', icon: Vote, label: 'Vote' },
  { id: 'submitting', title: 'Submit Vote', description: 'Generate proof and submit vote transaction', icon: Send, label: 'Submit' }
];

export function VoteModal({ isOpen, onClose, poll, onVoteSuccess }: VoteModalProps) {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoteOption, setSelectedVoteOption] = useState<number | null>(null);

  const { getMACIKeys } = useUserMACIKey();
  
  const userKeyPair = useMemo(() => {
    return getMACIKeys(maciAddress, address)
  }, [getMACIKeys, address])

  const { hasJoined, vote } = useVotePoll({
    poll: poll.pollContract,
    pollId: BigInt(poll.id),
    keyPair: userKeyPair,
  });

  const { voteOptions } = usePollSharedData({
    poll: poll.pollContract,
    pollId: BigInt(poll.id),
    keyPair: userKeyPair,
  });

  // Check if user has joined the poll
  useEffect(() => {
    if (isOpen) {
      if (!hasJoined) {
        setError('You must join the poll before voting');
        return;
      }
      setCurrentStep(0);
      setError(null);
      setSelectedVoteOption(null);
    }
  }, [isOpen, hasJoined]);

  const handleVoteSelection = (optionIndex: number) => {
    setSelectedVoteOption(optionIndex);
    setCurrentStep(1);
  };

  const handleSubmitVote = async () => {
    if (selectedVoteOption === null) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      await vote(selectedVoteOption);
      
      // On success
      onVoteSuccess?.();
      onClose();
      
    } catch (err) {
      let errorMessage = 'Failed to submit vote';
      
      if (err instanceof Error) {
        if (err.message.includes('User rejected') || err.message.includes('user denied')) {
          errorMessage = 'Vote cancelled by user';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
        setSelectedVoteOption(null);
      }, 200);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Vote className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary-foreground">Cast Your Vote</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Choose your preferred option. Your vote will be encrypted and kept private.
              </p>
              
              <div className="space-y-2">
                {Array.from({ length: Number(voteOptions ?? 2) }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handleVoteSelection(index)}
                    className="w-full p-3 rounded-lg border bg-secondary hover:bg-muted transition-colors text-left flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                      {selectedVoteOption === index && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium">Option {index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="w-full max-w-sm mx-auto text-center space-y-6 transition-all duration-300 ease-in-out">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Send className="h-8 w-8 text-orange-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-secondary-foreground">Submit Vote</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {selectedVoteOption !== null 
                  ? `Submit your vote for Option ${selectedVoteOption + 1}. Your vote will be encrypted and proven with zero-knowledge.`
                  : 'Generate proof and submit your encrypted vote to the blockchain.'
                }
              </p>
              
              {selectedVoteOption !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                  <div className="flex items-center gap-2 text-blue-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Selected: Option {selectedVoteOption + 1}</span>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => void handleSubmitVote()}
              disabled={isProcessing || selectedVoteOption === null}
              className="w-full rounded-sm"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Vote...
                </>
              ) : (
                'Submit Vote'
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
              <div className="min-h-[350px] flex items-center justify-center">
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
                disabled={isProcessing}
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

export default VoteModal;