'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { getPollById } from '@/config/poll';
import { usePoll } from '@/hooks/usePoll';
import Header from '@/components/layout/header/Header';
import { Button, AddressBadge, KeyBadge } from '@/components/common';
import Link from 'next/link';

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
  
  const pollConfig = getPollById(pollId);
  
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

  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return 'Not set';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };


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
          <Link href="/polls">
            <Button variant="secondary">Back to Polls</Button>
          </Link>
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
              <InfoItem label="Start Date" value={formatTimestamp(startDate)} />
              <InfoItem label="End Date" value={formatTimestamp(endDate)} />
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
    </div>
  );
}