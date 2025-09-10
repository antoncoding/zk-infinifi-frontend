'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { getCurrentVotingState, SEMAPHORE_CONTRACT_ADDRESS, ALLOCATION_VOTING } from '@/config/semaphore';
import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import { useSemaphoreIdentity } from '@/hooks/useSemaphoreIdentity';
import { useAllocationVoting } from '@/hooks/useAllocationVoting';
import { useSemaphoreVoting } from '@/hooks/useSemaphoreVoting';
import { useSemaphoreJoinGroup } from '@/hooks/useSemaphoreJoinGroup';
import { useUserVotingGroup } from '@/hooks/useUserVotingGroup';
import Header from '@/components/layout/header/Header';
import { Button, AddressBadge } from '@/components/common';
import { Avatar } from '@/components/Avatar/Avatar';
import { Badge } from '@/components/common/Badge';
import { SemaphoreVoteModal } from '@/components/common/SemaphoreVoteModal';
import { GroupSelectionModal } from '@/components/common/GroupSelectionModal';
import { useStyledToast } from '@/hooks/useStyledToast';
import { TransactionToast } from '@/components/common/StyledToast';
import { toast } from 'react-toastify';
import { Loader2, Shield, Users, Vote, CheckCircle2, AlertCircle } from 'lucide-react';
import { getExplorerTxURL } from '@/utils/external';
import { SupportedNetworks } from '@/utils/networks';

function InfoBox({ title, children, className = '' }: { 
  title: string; 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`rounded-lg border bg-secondary p-6 shadow-sm ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-secondary-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | bigint | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium text-secondary-foreground">{String(value)}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: 'not-connected' | 'no-identity' | 'not-member' | 'can-vote' | 'voted' }) {
  const statusConfig = {
    'not-connected': { label: 'Connect Wallet', className: 'bg-gray-100 text-gray-700', icon: null },
    'no-identity': { label: 'Generate Identity', className: 'bg-blue-100 text-blue-700', icon: Shield },
    'not-member': { label: 'Join Group', className: 'bg-orange-100 text-orange-700', icon: Users },
    'can-vote': { label: 'Ready to Vote', className: 'bg-green-100 text-green-700', icon: Vote },
    'voted': { label: 'Vote Cast', className: 'bg-purple-100 text-purple-700', icon: CheckCircle2 }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Badge className={config.className}>
      {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

export default function VotingDashboard() {
  const { address, isConnected } = useAccount();
  const votingState = getCurrentVotingState();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showGroupSelectionModal, setShowGroupSelectionModal] = useState(false);
  const [selectedGroupForJoining, setSelectedGroupForJoining] = useState<'whale' | 'dolphin' | 'shrimp' | null>(null);
  
  // Toast hook for notifications
  const { success: showSuccessToast, error: showErrorToast } = useStyledToast();
  
  // Semaphore hooks
  const { 
    userState, 
    generateIdentity, 
    getStoredSignature,
    loading: identityLoading, 
    error: identityError,
    isSigningMessage 
  } = useSemaphoreIdentity();
  
  // Allocation voting contract data
  const {
    owner,
    shrimpGroupId,
    dolphinGroupId,
    whaleGroupId,
    shrimpWeight,
    dolphinWeight,
    whaleWeight,
    shrimpMembers,
    dolphinMembers,
    whaleMembers,
    isLoading: allocationLoading,
    error: allocationError,
    refetchAll: refetchAllocationData
  } = useAllocationVoting(ALLOCATION_VOTING, SEMAPHORE_CONTRACT_ADDRESS);

  // User's voting group and membership
  const {
    activeGroup,
    memberships,
    isLoading: groupLoading,
    error: groupError,
    refetchAll: refetchGroupData
  } = useUserVotingGroup(ALLOCATION_VOTING, userState.identity);
  
  const { 
    hasVoted, 
    voteResults, 
    loading: votingLoading,
    submitVote,
    refreshResults,
    error: votingError
  } = useSemaphoreVoting(userState.identity, activeGroup.groupId);

  // Join group functionality
  const { joinGroup, isJoining, error: joinError } = useSemaphoreJoinGroup(() => {
    // Refresh data after successful join
    refetchGroupData();
    refetchAllocationData();
  });

  // Determine user status for UI
  const getUserStatus = () => {
    if (!isConnected) return 'not-connected';
    if (!userState.hasIdentity) return 'no-identity';
    
    // Check if user has an active voting group
    if (!activeGroup.type) return 'not-member';
    
    if (hasVoted) return 'voted';
    return 'can-vote';
  };

  const userStatus = getUserStatus();

  // Handle generate identity
  const handleGenerateIdentity = async () => {
    const identity = await generateIdentity();
    if (!identity) {
      console.error('Failed to generate identity');
    }
  };

  // Handle opening group selection modal
  const handleOpenGroupSelection = () => {
    setShowGroupSelectionModal(true);
  };

  // Handle group selection from modal
  const handleGroupSelected = (groupType: 'whale' | 'dolphin' | 'shrimp') => {
    setSelectedGroupForJoining(groupType);
    setShowGroupSelectionModal(false);
    // Immediately proceed with joining the selected group
    void handleJoinGroup(groupType);
  };

  // Handle join group success
  const handleJoinGroupSuccess = (groupType: string, transactionHash?: string) => {
    const groupName = groupType.charAt(0).toUpperCase() + groupType.slice(1);
    console.log(`✅ Successfully joined ${groupName} group!`, transactionHash ? `Transaction: ${transactionHash}` : '');
    
    // Show toast notification with transaction hash
    if (transactionHash) {
      toast.success(
        <TransactionToast 
          title={`Joined ${groupName} Group! 🎉`} 
          description="You can now participate in anonymous voting."
          hash={transactionHash}
        />,
        {
          autoClose: 8000, // Show longer for transaction hash
          onClick: () => {
            // Open block explorer when clicked (Base Sepolia)
            const explorerUrl = getExplorerTxURL(transactionHash, SupportedNetworks.BaseSepolia);
            window.open(explorerUrl, '_blank');
          }
        }
      );
    } else {
      showSuccessToast(
        `Joined ${groupName} Group! 🎉`, 
        'You can now participate in anonymous voting.'
      );
    }
    
    // Reset state and refresh data
    setSelectedGroupForJoining(null);
    refetchAllocationData();
    refetchGroupData();
  };

  // Handle join group error
  const handleJoinGroupError = (error: string, groupType?: string) => {
    const groupName = groupType ? ` ${groupType.charAt(0).toUpperCase() + groupType.slice(1)}` : '';
    console.error('❌ Join group error:', error);
    showErrorToast(`Failed to Join${groupName} Group`, error);
  };

  // Handle join group - now uses selected group instead of activeGroup
  const handleJoinGroup = async (groupType?: 'whale' | 'dolphin' | 'shrimp') => {
    try {
      const targetGroupType = groupType ?? selectedGroupForJoining;
      if (!userState.identity || !targetGroupType) {
        handleJoinGroupError('Missing identity or group type for joining', targetGroupType ?? undefined);
        return;
      }
      
      // Get the group ID based on the selected type
      let targetGroupId: bigint | undefined;
      switch (targetGroupType) {
        case 'whale':
          targetGroupId = whaleGroupId;
          break;
        case 'dolphin':
          targetGroupId = dolphinGroupId;
          break;
        case 'shrimp':
          targetGroupId = shrimpGroupId;
          break;
      }
      
      if (!targetGroupId) {
        handleJoinGroupError(`Group ID not found for ${targetGroupType} group`, targetGroupType);
        return;
      }
      
      const storedSignature = getStoredSignature();
      if (!storedSignature) {
        handleJoinGroupError('No signature found - please generate identity first', targetGroupType);
        return;
      }
      
      console.log(`🎯 Attempting to join ${targetGroupType} group with ID: ${targetGroupId.toString()}`);
      const result = await joinGroup(userState.identity, targetGroupId, storedSignature);
      
      if (result.success) {
        handleJoinGroupSuccess(targetGroupType, result.transactionHash);
      } else {
        handleJoinGroupError(result.error ?? 'Unknown error occurred', targetGroupType);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred';
      handleJoinGroupError(errorMessage, groupType);
    }
  };

  // Handle vote success
  const handleVoteSuccess = (transactionHash?: string) => {
    console.log('Vote cast successfully!', transactionHash ? `Transaction: ${transactionHash}` : '');
    
    // Show toast notification with transaction hash
    if (transactionHash) {
      toast.success(
        <TransactionToast 
          title="Vote Cast Successfully! 🗳️" 
          description="Your anonymous vote has been recorded on the blockchain."
          hash={transactionHash}
        />,
        {
          autoClose: 8000, // Show longer for transaction hash
          onClick: () => {
            // Open block explorer when clicked (Base Sepolia)
            window.open(`https://sepolia.basescan.org/tx/${transactionHash}`, '_blank');
          }
        }
      );
    } else {
      showSuccessToast('Vote Cast Successfully! 🗳️', 'Your anonymous vote has been recorded.');
    }
    
    refetchAllocationData();
    refetchGroupData();
    void refreshResults();
  };

  // Handle voting - pass the vote option to backend
  const handleVote = async (voteOption: number, identity: Identity, group: Group) => {
    try {
      console.log('🗳️ Vote handler called with:', {
        voteOption,
        identityCommitment: identity.commitment.toString(),
        groupSize: group.size,
        activeGroupType: activeGroup.type,
        activeGroupId: activeGroup.groupId?.toString(),
        group
      });
      
      // Use the real submitVote function which generates proofs and calls backend
      const result = await submitVote(voteOption, identity, group);
      
      console.log('📊 Vote submission result:', result);
      
      if (result.success) {
        handleVoteSuccess(result.transactionHash);
      }
      
      return result.success;
    } catch (error) {
      console.error('❌ Vote submission error:', error);
      return false;
    }
  };


  // Debug logging for group data
  console.log('🔍 Group debug info:', {
    activeGroupType: activeGroup.type,
    activeGroupId: activeGroup.groupId?.toString(),
    memberships: memberships,
    hasUserIdentity: !!userState.identity,
    userCommitment: userState.identity?.commitment.toString().slice(0, 10) + '...'
  });

  const isLoading = identityLoading || allocationLoading || votingLoading || groupLoading;

  return (
    <div className="bg-main flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {votingState.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {votingState.description ?? 'Anonymous voting powered by Semaphore zero-knowledge proofs'}
            </p>
          </div>
          
          {/* User Status & Actions */}
          <div className="flex items-center gap-3">
            {!isConnected ? (
              <div className="text-sm text-muted-foreground">
                Connect wallet to participate
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {address && <Avatar address={address} size={20} />}
                  <StatusBadge status={userStatus} />
                </div>
                
                {userStatus === 'no-identity' && (
                  <Button 
                    onClick={() => void handleGenerateIdentity()}
                    disabled={isLoading}
                    className="rounded-sm"
                  >
                    {isSigningMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sign Message...
                      </>
                    ) : identityLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Generate Identity
                      </>
                    )}
                  </Button>
                )}
                
                {userStatus === 'not-member' && (
                  <Button 
                    onClick={handleOpenGroupSelection}
                    disabled={isLoading || isJoining}
                    className="rounded-sm"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Select & Join Group
                      </>
                    )}
                  </Button>
                )}
                
                {userStatus === 'can-vote' && (
                  <Button 
                    onClick={() => setShowVoteModal(true)}
                    className="rounded-sm"
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Cast Vote
                  </Button>
                )}
                
                {userStatus === 'voted' && (
                  <Button 
                    disabled
                    variant="secondary"
                    className="rounded-sm bg-green-50 border-green-200 text-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Vote Cast
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(identityError ?? allocationError ?? groupError ?? joinError ?? votingError) && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">
                  {votingError ? 'Voting Error' : 'Error'}
                </p>
                <p className="text-sm text-red-600">
                  {votingError?.message ?? identityError?.message ?? allocationError?.message ?? groupError?.message ?? joinError}
                </p>
                {votingError?.type && (
                  <p className="text-xs text-red-500 mt-1 font-mono">
                    Error Type: {votingError.type}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-3" />
            <span className="text-gray-600">Loading voting data...</span>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Allocation Voting Information */}
          <InfoBox title="Allocation Voting">
            <InfoItem label="Status" value={votingState.isActive ? 'Active' : 'Inactive'} />
            <InfoItem label="Your Status" value={userStatus.replace('-', ' ')} />
            {owner && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Contract Owner:</span>
                <AddressBadge address={owner} />
              </div>
            )}
            {userState.commitment && (
              <InfoItem label="Your Commitment" value={`${userState.commitment.slice(0, 6)}...${userState.commitment.slice(-4)}`} />
            )}
          </InfoBox>

          {/* Active Voting Group */}
          {activeGroup.type && (
            <InfoBox title="Active Voting Group" className="border-green-200 bg-green-50">
              <div className="flex items-center justify-between p-3 bg-white rounded border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {activeGroup.type === 'whale' ? '🐋' : activeGroup.type === 'dolphin' ? '🐬' : '🦐'}
                  </div>
                  <div>
                    <p className="font-medium text-green-800 capitalize">{activeGroup.type} Group</p>
                    <p className="text-sm text-green-600">You will vote with this group</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
            </InfoBox>
          )}

          {/* Group Memberships */}
          <InfoBox title="All Group Tiers">
            <div className="space-y-2">
              <div className={`flex items-center justify-between p-2 rounded ${memberships.isShrimp ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                <span className="text-sm font-medium flex items-center gap-2">
                  🦐 Shrimp Group
                  {memberships.isShrimp && <Badge className="bg-green-100 text-green-700 text-xs">Member</Badge>}
                </span>
                <span className="text-sm">{shrimpMembers?.toString() ?? '0'} members</span>
              </div>
              
              <div className={`flex items-center justify-between p-2 rounded ${memberships.isDolphin ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                <span className="text-sm font-medium flex items-center gap-2">
                  🐬 Dolphin Group
                  {memberships.isDolphin && <Badge className="bg-blue-100 text-blue-700 text-xs">Member</Badge>}
                </span>
                <span className="text-sm">{dolphinMembers?.toString() ?? '0'} members</span>
              </div>
              
              <div className={`flex items-center justify-between p-2 rounded ${memberships.isWhale ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                <span className="text-sm font-medium flex items-center gap-2">
                  🐋 Whale Group
                  {memberships.isWhale && <Badge className="bg-purple-100 text-purple-700 text-xs">Member</Badge>}
                </span>
                <span className="text-sm">{whaleMembers?.toString() ?? '0'} members</span>
              </div>
            </div>
          </InfoBox>

          {/* Vote Options & Results */}
          <InfoBox title="Vote Options" className="md:col-span-2 lg:col-span-1">
            <div className="space-y-3">
              {votingState.voteOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.title}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                    )}
                  </div>
                  <div className="text-sm font-medium ml-3">
                    {voteResults[option.id.toString()] ?? 0} votes
                  </div>
                </div>
              ))}
            </div>
          </InfoBox>

          {/* Contract Information */}
          <InfoBox title="Contract Information" className="md:col-span-2">
            <div className="space-y-2">
              {ALLOCATION_VOTING !== '0x0000000000000000000000000000000000000000' && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Voting Contract:</span>
                  <AddressBadge address={ALLOCATION_VOTING} />
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Semaphore Contract:</span>
                <AddressBadge address={SEMAPHORE_CONTRACT_ADDRESS} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Shrimp Group</div>
                  <div className="text-sm font-mono">{shrimpGroupId?.toString() ?? '-'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Dolphin Group</div>
                  <div className="text-sm font-mono">{dolphinGroupId?.toString() ?? '-'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Whale Group</div>
                  <div className="text-sm font-mono">{whaleGroupId?.toString() ?? '-'}</div>
                </div>
              </div>
            </div>
          </InfoBox>
        </div>
      </main>
      
      {/* Group Selection Modal */}
      <GroupSelectionModal
        isOpen={showGroupSelectionModal}
        onClose={() => setShowGroupSelectionModal(false)}
        onGroupSelected={handleGroupSelected}
        groupIds={{
          shrimpGroupId,
          dolphinGroupId,
          whaleGroupId
        }}
        groupMemberCounts={{
          shrimpMembers,
          dolphinMembers,
          whaleMembers
        }}
        groupWeights={{
          shrimpWeight: shrimpWeight as bigint | undefined,
          dolphinWeight: dolphinWeight as bigint | undefined,
          whaleWeight: whaleWeight as bigint | undefined
        }}
      />
      
      {/* Vote Modal */}
      <SemaphoreVoteModal
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        onVoteSuccess={() => handleVoteSuccess()}
        userIdentity={userState.identity}
        group={activeGroup.group}
        onSubmitVote={handleVote}
      />
    </div>
  );
}