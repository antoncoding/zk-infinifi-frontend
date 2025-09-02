'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { getPollById } from '@/config/poll';
import { usePoll } from '@/hooks/usePoll';
import { useMACIRegistration } from '@/hooks/useMACIRegistration';
import { usePollUserStats } from '@/hooks/usePollUserStats';
import { useUserMACIKey } from '@/hooks/useUserMACIKey';
import { getMaciAddress } from '@/config/poll';
import { useAccount } from 'wagmi';
import Header from '@/components/layout/header/Header';
import { Button, AddressBadge, KeyBadge, JoinModal, VoteModal, RegistrationModal } from '@/components/common';
import Link from 'next/link';
import { formatPollStatus } from '@/utils/timeFormat';

function PollInfoBox({ title, children, className = '' }: { 
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

function AddressInfoItem({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <AddressBadge address={address as `0x${string}`} />
    </div>
  );
}

export default function PollDetailPage() {
  const params = useParams();
  const pollId = params.id as string;
  const [isJoinModalOpen, setIsJoinModalOpen] = React.useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = React.useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  
  const { address } = useAccount();
  const pollConfig = getPollById(pollId);
  const { isFullyRegistered, loading: statusLoading, refresh } = useMACIRegistration();
  const { getMACIKeys } = useUserMACIKey();
  
  const maciAddress = getMaciAddress();
  const userKeyPair = React.useMemo(() => {
    return getMACIKeys(maciAddress, address)
  }, [getMACIKeys, maciAddress, address]);
  
  const { hasJoined, refresh: refreshPollStats } = usePollUserStats({
    poll: pollConfig?.pollContract ?? '0x',
    pollId: BigInt(pollConfig?.id ?? '0'),
    keyPair: userKeyPair,
  });
  
  // Auto-refresh registration status to detect when user becomes fully registered
  React.useEffect(() => {
    if (!isFullyRegistered) {
      const interval = setInterval(() => {
        refresh?.();
      }, 3000); // Check every 3 seconds when not fully registered
      
      return () => clearInterval(interval);
    }
  }, [isFullyRegistered, refresh]);
  
  // Auto-refresh poll stats to detect when user joins
  React.useEffect(() => {
    if (isFullyRegistered && !hasJoined) {
      const interval = setInterval(() => {
        void refreshPollStats?.();
      }, 3000); // Check every 3 seconds when registered but not joined
      
      return () => clearInterval(interval);
    }
  }, [isFullyRegistered, hasJoined, refreshPollStats]);
  
  const { 
    startDate,
    endDate,
    pollId: contractPollId,
    maxSignups,
    totalSignups,
    voteOptions,
    numMessages,
    initialized,
    stateMerged,
    coordinatorPublicKey,
    extContracts,
    isLoading
  } = usePoll({ 
    address: pollConfig?.pollContract ?? '0x', 
    refetchInterval: 5000 
  });

  if (!pollConfig) {
    return (
      <div className="bg-main flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex flex-1 flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Poll Not Found</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">The poll with ID "{pollId}" was not found.</p>
            <Link href="/polls">
              <Button>Back to Polls</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }



  return (
    <div className="bg-main flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {pollConfig.name ?? `Poll #${pollId}`}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Poll ID: {pollId}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/polls">
              <Button variant="secondary">Back to Polls</Button>
            </Link>
            {statusLoading ? (
              <Button disabled className="rounded-sm">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                Loading...
              </Button>
            ) : !isFullyRegistered ? (
              <Button onClick={() => setIsRegisterModalOpen(true)} className="rounded-sm">
                Register
              </Button>
            ) : !hasJoined ? (
              <Button onClick={() => setIsJoinModalOpen(true)} className="rounded-sm">
                Join Poll
              </Button>
            ) : (
              <Button onClick={() => setIsVoteModalOpen(true)} className="rounded-sm">
                Vote
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading poll data...</span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Poll Information */}
            <PollInfoBox title="Poll Information">
              <InfoItem label="Contract Poll ID" value={contractPollId} />
              <InfoItem label="Status" value={formatPollStatus(startDate, endDate)} />
              <InfoItem label="Initialized" value={initialized ? 'Yes' : 'No'} />
              <InfoItem label="State Merged" value={stateMerged ? 'Yes' : 'No'} />
            </PollInfoBox>

            {/* Participation Stats */}
            <PollInfoBox title="Participation">
              <InfoItem label="Total Signups" value={totalSignups} />
              <InfoItem label="Max Signups" value={maxSignups} />
              <InfoItem label="Vote Options" value={voteOptions} />
              <InfoItem label="Messages" value={numMessages} />
            </PollInfoBox>

            {/* Contract Addresses */}
            <PollInfoBox title="Contract Addresses" className="md:col-span-2 lg:col-span-1">
              <AddressInfoItem label="Poll Contract" address={pollConfig.pollContract} />
              <AddressInfoItem label="Message Processor" address={pollConfig.messageProcessor} />
              <AddressInfoItem label="Tally Contract" address={pollConfig.tally} />
            </PollInfoBox>

            {/* External Contracts */}
            {extContracts && (
              <PollInfoBox title="External Contracts" className="md:col-span-2">
                <AddressInfoItem label="MACI" address={extContracts.maci} />
                <AddressInfoItem label="Verifier" address={extContracts.verifier} />
                <AddressInfoItem label="Keys Registry" address={extContracts.verifyingKeysRegistry} />
                <AddressInfoItem label="Policy" address={extContracts.policy} />
                <AddressInfoItem label="Voice Credit Proxy" address={extContracts.initialVoiceCreditProxy} />
              </PollInfoBox>
            )}

            {/* Coordinator */}
            {coordinatorPublicKey && (
              <PollInfoBox title="Coordinator Public Key" className="lg:col-span-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Key:</span>
                  <div className="min-w-0 flex-1 text-right">
                    <KeyBadge className="max-w-full" value={coordinatorPublicKey.serialize()} />
                  </div>
                </div>
              </PollInfoBox>
            )}
          </div>
        )}
      </main>
      
      {pollConfig && (
        <>
          <JoinModal
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            poll={pollConfig}
            onJoinSuccess={() => {
              void refreshPollStats?.();
              setIsJoinModalOpen(false);
            }}
          />
          
          <VoteModal
            isOpen={isVoteModalOpen}
            onClose={() => setIsVoteModalOpen(false)}
            poll={pollConfig}
            onVoteSuccess={() => {
              setIsVoteModalOpen(false);
            }}
          />
          
          <RegistrationModal
            isOpen={isRegisterModalOpen}
            onClose={() => setIsRegisterModalOpen(false)}
            pollId={pollId}
            onSuccess={() => {
              refresh?.();
              setIsRegisterModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}