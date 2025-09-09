'use client';

import React, { useState, useEffect } from 'react';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Vote, Send, AlertCircle, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { getCurrentVotingState } from '@/config/semaphore';

const STEPS = [
  { id: 'voting', title: 'Select Option', description: 'Choose your preferred vote', icon: Vote, label: 'Vote' },
  { id: 'submitting', title: 'Submit Proof', description: 'Generate anonymous proof and submit', icon: Send, label: 'Submit' }
];

type SemaphoreVoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess?: () => void;
  userIdentity?: Identity;
  group?: Group;
  onSubmitVote?: (voteOption: number, identity: Identity, group: Group) => Promise<boolean>;
};

export function SemaphoreVoteModal({ 
  isOpen, 
  onClose, 
  onVoteSuccess,
  userIdentity,
  group,
  onSubmitVote 
}: SemaphoreVoteModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoteOption, setSelectedVoteOption] = useState<number | null>(null);

  const votingState = getCurrentVotingState();

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setError(null);
      setSelectedVoteOption(null);
    }
  }, [isOpen]);

  const handleVoteSelection = (optionIndex: number) => {
    setSelectedVoteOption(optionIndex);
    setCurrentStep(1);
  };

  const handleSubmitVote = async () => {
    if (selectedVoteOption === null ?? !userIdentity ?? !group ?? !onSubmitVote) return;

    try {
      setError(null);
      setIsProcessing(true);
      
      const success = await onSubmitVote(selectedVoteOption, userIdentity, group);
      
      if (success) {
        onVoteSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
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

  const handleBackToOptions = () => {
    setCurrentStep(0);
    setError(null);
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
                Select your preferred option. Your vote will be anonymous and verified using zero-knowledge proofs.
              </p>
              
              <div className="space-y-3">
                {votingState.voteOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleVoteSelection(option.id)}
                    className="w-full p-4 rounded-lg border bg-secondary hover:bg-muted transition-all text-left flex items-start gap-3 hover:shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                      {selectedVoteOption === option.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">{option.title}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mt-4">
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="h-3 w-3" />
                  <span className="font-medium">Privacy Guaranteed</span>
                </div>
                <p>Your vote is completely anonymous and cannot be traced back to you.</p>
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
                Generate an anonymous proof and submit your encrypted vote to the blockchain.
              </p>
              
              {selectedVoteOption !== null && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">
                      Selected: {votingState.voteOptions.find(o => o.id === selectedVoteOption)?.title}
                    </span>
                  </div>
                  {votingState.voteOptions.find(o => o.id === selectedVoteOption)?.description && (
                    <p className="text-green-600 text-xs mt-1">
                      {votingState.voteOptions.find(o => o.id === selectedVoteOption)?.description}
                    </p>
                  )}
                </div>
              )}

              <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                <p className="font-medium mb-1">Zero-Knowledge Proof:</p>
                <p>This will prove you're a group member without revealing your identity or linking to previous votes.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBackToOptions}
                disabled={isProcessing}
                className="flex-1 rounded-sm"
              >
                Back
              </Button>
              <Button
                onClick={() => void handleSubmitVote()}
                disabled={isProcessing ?? selectedVoteOption === null}
                className="flex-1 rounded-sm"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Vote
                  </>
                )}
              </Button>
            </div>
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
              <div className="min-h-[400px] flex items-center justify-center">
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