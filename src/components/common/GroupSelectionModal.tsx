'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/common/Badge';
import { Users, ArrowRight, Info } from 'lucide-react';

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
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                disabled={!selectedGroup}
                className="rounded-sm"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Join {selectedGroup ? GROUP_OPTIONS.find(g => g.type === selectedGroup)?.name : 'Group'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}