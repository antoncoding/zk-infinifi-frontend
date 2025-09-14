'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/common/Badge';
import { Users, ArrowRight, Info, AlertCircle, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { MOCK_ASSET_ADDRESS } from '@/config/semaphore';
import { formatUnits } from 'viem';

type GroupType = 'whale' | 'dolphin' | 'shrimp';

type GroupOption = {
  type: GroupType;
  name: string;
  emoji: string;
  description: string;
};

const GROUP_OPTIONS: GroupOption[] = [
  {
    type: 'shrimp' as const,
    name: 'Shrimp',
    emoji: '🦐',
    description: 'Entry-level voting tier'
  },
  {
    type: 'dolphin' as const,
    name: 'Dolphin',
    emoji: '🐬',
    description: 'Intermediate voting tier'
  },
  {
    type: 'whale' as const,
    name: 'Whale',
    emoji: '🐋',
    description: 'Advanced voting tier'
  }
];

// Balance requirements for each group tier (in iUSDC with 6 decimals)
const BALANCE_REQUIREMENTS = {
  shrimp: BigInt(1_000_000), // 1 iUSDC
  dolphin: BigInt(2_000_000), // 2 iUSDC
  whale: BigInt(5_000_000), // 5 iUSDC
};

type GroupSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGroupSelected: (groupType: GroupType) => void;
  groupIds: {
    shrimpGroupId: bigint | undefined;
    dolphinGroupId: bigint | undefined; 
    whaleGroupId: bigint | undefined;
  };
  groupMemberCounts: {
    shrimpMembers: bigint | undefined;
    dolphinMembers: bigint | undefined;
    whaleMembers: bigint | undefined;
  };
  groupWeights: {
    shrimpWeight: bigint | undefined;
    dolphinWeight: bigint | undefined;
    whaleWeight: bigint | undefined;
  };
};

export function GroupSelectionModal({
  isOpen,
  onClose,
  onGroupSelected,
  groupIds,
  groupMemberCounts,
  groupWeights
}: GroupSelectionModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const { address } = useAccount();

  const { balance, isLoadingBalance } = useTokenBalance({
    token: MOCK_ASSET_ADDRESS,
    user: address
  });

  const balanceDisplay = formatUnits(balance, 6);

  const getRequiredBalance = (groupType: GroupType): bigint => {
    return BALANCE_REQUIREMENTS[groupType];
  };

  const hasEnoughBalance = (groupType: GroupType): boolean => {
    return balance >= getRequiredBalance(groupType);
  };

  const handleGroupSelect = (groupType: GroupType) => {
    setSelectedGroup(groupType);
  };

  const handleConfirmSelection = () => {
    if (selectedGroup) {
      onGroupSelected(selectedGroup);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedGroup(null);
    onClose();
  };

  const getGroupId = (groupType: GroupType): bigint | undefined => {
    switch (groupType) {
      case 'shrimp': return groupIds.shrimpGroupId;
      case 'dolphin': return groupIds.dolphinGroupId;
      case 'whale': return groupIds.whaleGroupId;
      default: return undefined;
    }
  };

  const getMemberCount = (groupType: GroupType): number => {
    switch (groupType) {
      case 'shrimp': return Number(groupMemberCounts.shrimpMembers ?? 0);
      case 'dolphin': return Number(groupMemberCounts.dolphinMembers ?? 0);
      case 'whale': return Number(groupMemberCounts.whaleMembers ?? 0);
      default: return 0;
    }
  };

  const getGroupWeight = (groupType: GroupType): string => {
    let weight: bigint | undefined;
    switch (groupType) {
      case 'shrimp': weight = groupWeights.shrimpWeight; break;
      case 'dolphin': weight = groupWeights.dolphinWeight; break;
      case 'whale': weight = groupWeights.whaleWeight; break;
      default: return '0x';
    }
    
    if (!weight) return '0x';
    
    // Convert from wei (1e18) to decimal
    const weightInEther = Number(weight) / 1e18;
    return `${weightInEther}x`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-lg border bg-secondary shadow-lg sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-6 pb-4 border-b border-border/50">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Select Voting Group</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Choose your voting tier
              </p>
            </div>
          </div>

          {/* Group Options */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {GROUP_OPTIONS.map((group) => {
                const groupId = getGroupId(group.type);
                const memberCount = getMemberCount(group.type);
                const weight = getGroupWeight(group.type);
                const isSelected = selectedGroup === group.type;
                const isAvailable = !!groupId;
                const hasBalance = hasEnoughBalance(group.type);
                const requiredAmount = formatUnits(getRequiredBalance(group.type), 6);

                return (
                  <div
                    key={group.type}
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                      !isAvailable
                        ? 'border-border/30 bg-muted/30 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-primary bg-primary/5 shadow-md dark:bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                    onClick={() => isAvailable && handleGroupSelect(group.type)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && isAvailable) {
                        e.preventDefault();
                        handleGroupSelect(group.type);
                      }
                    }}
                    tabIndex={isAvailable ? 0 : -1}
                    role="button"
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-4">
                      {/* Group Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {group.emoji}
                      </div>
                      
                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-semibold text-foreground">
                            {group.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary text-xs font-mono">
                              {weight}
                            </Badge>
                            {isSelected && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {group.description}
                        </p>

                        {/* Group Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{memberCount} members</span>
                          </div>
                          {groupId && (
                            <div className="flex items-center gap-1">
                              <span className="font-mono">ID: {groupId.toString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Balance Requirement - only show when selected */}
                        {isSelected && (
                          <div className="text-xs mt-2">
                            {isLoadingBalance ? (
                              <div className="text-gray-500 bg-gray-100 rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-400">
                                Checking balance...
                              </div>
                            ) : hasBalance ? (
                              <div className="text-green-600 bg-green-50 rounded px-2 py-1 dark:bg-green-900/20 dark:text-green-400">
                                ✓ Balance: {balanceDisplay} / {requiredAmount} iUSDC
                              </div>
                            ) : (
                              <div className="text-red-600 bg-red-50 rounded px-2 py-1 dark:bg-red-900/20 dark:text-red-400">
                                ⚠ Requires {requiredAmount} iUSDC (You have: {balanceDisplay})
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-background/90 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Info className="h-4 w-4" />
                          <span>Not available</span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* Balance Warning - shown when selected group has insufficient balance */}
          {selectedGroup && !hasEnoughBalance(selectedGroup) && (
            <div className="flex-shrink-0 p-4 bg-red-50 border-t border-red-200 dark:bg-red-950/20 dark:border-red-800/50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Insufficient Balance for {GROUP_OPTIONS.find(g => g.type === selectedGroup)?.name} Group</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Required: {formatUnits(getRequiredBalance(selectedGroup), 6)} iUSDC</p>
                  <p>Current balance: {balanceDisplay} iUSDC</p>
                  <p className="text-red-500 font-medium">Note: We're using USDC as iUSDC for this demo</p>
                </div>
                <a
                  href="https://faucet.circle.com/?network=basesepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-red-700 hover:text-red-800 underline font-medium"
                >
                  Get testnet USDC <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex-shrink-0 p-4 pt-3 border-t border-border/50">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>

              <Button
                onClick={handleConfirmSelection}
                disabled={!selectedGroup || (selectedGroup && !hasEnoughBalance(selectedGroup))}
                className="rounded-sm"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {selectedGroup && !hasEnoughBalance(selectedGroup)
                  ? `Need ${formatUnits(getRequiredBalance(selectedGroup), 6)} iUSDC`
                  : `Join ${selectedGroup ? GROUP_OPTIONS.find(g => g.type === selectedGroup)?.name : 'Group'}`
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}