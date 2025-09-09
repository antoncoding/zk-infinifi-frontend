'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { getCurrentVotingState } from '@/config/semaphore';
import { useSemaphoreIdentity } from '@/hooks/useSemaphoreIdentity';
import { useSemaphoreGroupContract } from '@/hooks/useSemaphoreGroupContract';
import { useSemaphoreVoting } from '@/hooks/useSemaphoreVotingSimplified';
import Header from '@/components/layout/header/Header';
import { Button, AddressBadge } from '@/components/common';
import { Avatar } from '@/components/Avatar/Avatar';
import { Badge } from '@/components/common/Badge';
import { Loader2, Shield, Users, Vote, CheckCircle2, AlertCircle } from 'lucide-react';

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
  // const [showJoinModal, setShowJoinModal] = useState(false);
  // const [showVoteModal, setShowVoteModal] = useState(false);
  
  const votingState = getCurrentVotingState();
  
  // Semaphore hooks
  const { 
    userState, 
    generateIdentity, 
    loading: identityLoading, 
    error: identityError,
    isSigningMessage 
  } = useSemaphoreIdentity();
  
  const { 
    merkleTreeRoot,
    merkleTreeSize,
    merkleTreeDepth,
    groupAdmin,
    isGroupMember,
    memberIndex,
    isLoading: groupLoading,
    error: groupError,
    // refetchGroupData,
    refetchMembership
  } = useSemaphoreGroupContract(userState.identity);
  
  const { 
    hasVoted, 
    voteResults, 
    totalVotes,
    loading: votingLoading 
  } = useSemaphoreVoting();

  // Determine user status for UI
  const getUserStatus = () => {
    if (!isConnected) return 'not-connected';
    if (!userState.hasIdentity) return 'no-identity';
    if (!isGroupMember) return 'not-member';
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

  // Handle join group - now requires backend since we can't directly add to contract
  const handleJoinGroup = async () => {
    if (!userState.identity) return;
    
    console.log('Join group - backend integration required');
    console.log('User identity commitment:', userState.identity.commitment.toString());
    console.log('Group ID:', votingState.groupId.toString());
    console.log('This will be handled by your backend implementation');
    
    // After backend adds user, refresh group data
    refetchMembership();
  };

  const isLoading = identityLoading || groupLoading || votingLoading;

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
                    onClick={() => void handleJoinGroup()}
                    disabled={isLoading}
                    className="rounded-sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Group
                  </Button>
                )}
                
                {userStatus === 'can-vote' && (
                  <Button 
                    onClick={() => {
                      // TODO: Implement voting modal
                      console.log('Open vote modal');
                    }}
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
        {(identityError ?? groupError) && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">Error</p>
                <p className="text-sm text-red-600">
                  {identityError?.message ?? groupError?.message}
                </p>
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
          {/* Voting Information */}
          <InfoBox title="Voting Information">
            <InfoItem label="Status" value={votingState.isActive ? 'Active' : 'Inactive'} />
            <InfoItem label="Vote Options" value={votingState.voteOptions.length} />
            <InfoItem label="Your Status" value={userStatus.replace('-', ' ')} />
            <InfoItem label="Group ID" value={votingState.groupId.toString()} />
          </InfoBox>

          {/* Participation Stats */}
          <InfoBox title="Participation">
            <InfoItem label="Total Members" value={merkleTreeSize?.toString() ?? '0'} />
            <InfoItem label="Total Votes" value={totalVotes} />
            <InfoItem label="Participation Rate" value={merkleTreeSize && merkleTreeSize > 0 ? `${Math.round((totalVotes / Number(merkleTreeSize)) * 100)}%` : '0%'} />
            {userState.commitment && (
              <InfoItem label="Your Commitment" value={`${userState.commitment.slice(0, 6)}...${userState.commitment.slice(-4)}`} />
            )}
            {memberIndex !== undefined && (
              <InfoItem label="Member Index" value={memberIndex.toString()} />
            )}
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
          {votingState.contractAddress !== '0x0000000000000000000000000000000000000000' && (
            <InfoBox title="Contract Information" className="md:col-span-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Contract Address:</span>
                <AddressBadge address={votingState.contractAddress} />
              </div>
              {merkleTreeRoot && (
                <InfoItem label="Merkle Tree Root" value={`${merkleTreeRoot.toString().slice(0, 8)}...`} />
              )}
              {merkleTreeDepth && (
                <InfoItem label="Tree Depth" value={merkleTreeDepth.toString()} />
              )}
              {groupAdmin && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Group Admin:</span>
                  <AddressBadge address={groupAdmin} />
                </div>
              )}
            </InfoBox>
          )}
        </div>
      </main>
      
      {/* TODO: Add modals for voting when implemented */}
    </div>
  );
}