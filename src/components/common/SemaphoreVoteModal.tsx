'use client';

import React, { useState, useEffect } from 'react';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Vote, Send, Loader2, CheckCircle2, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { getCurrentVotingState } from '@/config/semaphore';
import { AllocationData, VotingAsset, AllocationVote } from '@/types/semaphore';

const STEPS = [
  { id: 'allocation', title: 'Allocate Weights', description: 'Distribute your voting power across assets', icon: Vote, label: 'Allocate' },
  { id: 'submitting', title: 'Submit Proof', description: 'Generate anonymous proof and submit', icon: Send, label: 'Submit' }
];

// 1e18 constant for weight calculations (100% = 1e18)
const WEIGHT_PRECISION = BigInt('1000000000000000000');

type SemaphoreVoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess?: () => void;
  userIdentity?: Identity;
  group?: Group | null;
  onSubmitAllocation?: (allocationData: AllocationData, identity: Identity, group: Group) => Promise<boolean>;
};

export function SemaphoreVoteModal({ 
  isOpen, 
  onClose, 
  onVoteSuccess,
  userIdentity,
  group,
  onSubmitAllocation 
}: SemaphoreVoteModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Allocation state for liquid and illiquid assets
  const [liquidAllocations, setLiquidAllocations] = useState<Record<string, number>>({});
  const [illiquidAllocations, setIlliquidAllocations] = useState<Record<string, number>>({});

  const votingState = getCurrentVotingState();
  
  // Helper functions for weight calculations
  const calculateTotalPercentage = (allocations: Record<string, number>) => {
    return Object.values(allocations).reduce((sum, value) => sum + (value || 0), 0);
  };
  
  const liquidTotalPercentage = calculateTotalPercentage(liquidAllocations);
  const illiquidTotalPercentage = calculateTotalPercentage(illiquidAllocations);
  
  const isValidAllocation = () => {
    // Check if at least one allocation is made and both totals are <= 100
    const hasAllocation = liquidTotalPercentage > 0 || illiquidTotalPercentage > 0;
    const validTotals = liquidTotalPercentage <= 100 && illiquidTotalPercentage <= 100;
    return hasAllocation && validTotals;
  };

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setLiquidAllocations({});
      setIlliquidAllocations({});
    }
  }, [isOpen]);

  // Handle allocation input changes
  const handleAllocationChange = (
    assetId: string, 
    value: string, 
    type: 'liquid' | 'illiquid'
  ) => {
    const numValue = Math.max(0, Math.min(100, parseFloat(value) || 0));
    
    if (type === 'liquid') {
      setLiquidAllocations(prev => ({ ...prev, [assetId]: numValue }));
    } else {
      setIlliquidAllocations(prev => ({ ...prev, [assetId]: numValue }));
    }
  };

  // Convert percentage allocations to contract weight format (multiply by 1e18 / 100)
  const convertToContractWeight = (percentage: number): string => {
    if (percentage === 0) return '0';
    const weight = (WEIGHT_PRECISION * BigInt(Math.floor(percentage * 100))) / BigInt(10000);
    return weight.toString();
  };

  // Handle proceeding to submit step
  const handleProceedToSubmit = () => {
    if (isValidAllocation()) {
      setCurrentStep(1);
    }
  };

  // Handle submitting the allocation
  const handleSubmitAllocation = async () => {
    if (!group || !userIdentity || !onSubmitAllocation) {
      return;
    }

    if (!isValidAllocation()) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Convert allocations to AllocationVote arrays
      const liquidVotes: AllocationVote[] = votingState.liquidAssets.map(asset => ({
        farm: asset.address,
        weight: convertToContractWeight(liquidAllocations[asset.id] || 0)
      }));
      
      const illiquidVotes: AllocationVote[] = votingState.illiquidAssets.map(asset => ({
        farm: asset.address,
        weight: convertToContractWeight(illiquidAllocations[asset.id] || 0)
      }));
      
      const allocationData: AllocationData = {
        liquidVotes,
        illiquidVotes
      };
      
      console.log('Submitting allocation:', allocationData);
      
      const success = await onSubmitAllocation(allocationData, userIdentity, group);
      
      if (success) {
        onVoteSuccess?.();
        onClose();
      }
    } catch (err) {
      // Error handling is now done by the hook with toasts
      console.error('Error submitting allocation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setTimeout(() => {
        setCurrentStep(0);
        setLiquidAllocations({});
        setIlliquidAllocations({});
      }, 200);
    }
  };

  const handleBackToAllocation = () => {
    setCurrentStep(0);
  };
  
  // Component to render individual asset allocation input
  const renderAssetAllocation = (
    asset: VotingAsset, 
    allocations: Record<string, number>,
    type: 'liquid' | 'illiquid'
  ) => (
    <div key={asset.id} className="border rounded-lg p-4 bg-secondary/50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {type === 'liquid' ? (
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-purple-600" />
            )}
            <span className="font-medium text-sm">{asset.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">{asset.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={allocations[asset.id] || ''}
            onChange={(e) => handleAllocationChange(asset.id, e.target.value, type)}
            placeholder="0"
            className="w-20 text-right text-sm px-2 py-1 border rounded-md bg-background border-border focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <Percent className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Vote className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-foreground mb-2">Allocate Your Voting Power</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Distribute your voting power across liquid and illiquid farming strategies. Each category can total up to 100%.
              </p>
            </div>

            <div className="space-y-6">
              {/* Liquid Assets Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-secondary-foreground">Liquid Assets</h4>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded ${
                    liquidTotalPercentage > 100 ? 'bg-red-100 text-red-700' : 
                    liquidTotalPercentage === 100 ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {liquidTotalPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-2">
                  {votingState.liquidAssets.map(asset => 
                    renderAssetAllocation(asset, liquidAllocations, 'liquid')
                  )}
                </div>
              </div>

              {/* Illiquid Assets Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-secondary-foreground">Illiquid Assets</h4>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded ${
                    illiquidTotalPercentage > 100 ? 'bg-red-100 text-red-700' : 
                    illiquidTotalPercentage === 100 ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {illiquidTotalPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-2">
                  {votingState.illiquidAssets.map(asset => 
                    renderAssetAllocation(asset, illiquidAllocations, 'illiquid')
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleProceedToSubmit}
                disabled={!isValidAllocation()}
                className="px-8"
              >
                Continue to Submit
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="w-full max-w-lg mx-auto text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Send className="h-8 w-8 text-orange-600" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary-foreground">Submit Allocation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Generate an anonymous proof and relay your vote onchain.
              </p>
              
              {/* Allocation Summary */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm">
                <div className="flex items-center gap-2 text-green-700 mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Allocation Summary</span>
                </div>
                
                {liquidTotalPercentage > 0 && (
                  <div className="mb-3">
                    <div className="font-medium text-blue-700 mb-1">
                      Liquid Assets ({liquidTotalPercentage.toFixed(1)}%)
                    </div>
                    <div className="space-y-1 text-left">
                      {votingState.liquidAssets.map(asset => {
                        const allocation = liquidAllocations[asset.id];
                        return allocation > 0 ? (
                          <div key={asset.id} className="flex justify-between text-xs">
                            <span>{asset.name}</span>
                            <span>{allocation.toFixed(1)}%</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {illiquidTotalPercentage > 0 && (
                  <div>
                    <div className="font-medium text-purple-700 mb-1">
                      Illiquid Assets ({illiquidTotalPercentage.toFixed(1)}%)
                    </div>
                    <div className="space-y-1 text-left">
                      {votingState.illiquidAssets.map(asset => {
                        const allocation = illiquidAllocations[asset.id];
                        return allocation > 0 ? (
                          <div key={asset.id} className="flex justify-between text-xs">
                            <span>{asset.name}</span>
                            <span>{allocation.toFixed(1)}%</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBackToAllocation}
                disabled={isProcessing}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => void handleSubmitAllocation()}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Allocation
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
      <DialogContent className="rounded-lg border bg-secondary shadow-lg sm:max-w-3xl max-h-[90vh] overflow-hidden">
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