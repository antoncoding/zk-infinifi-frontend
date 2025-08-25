'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { getPollById } from '@/config/poll';
import { usePoll } from '@/hooks/usePoll';
import Header from '@/components/layout/header/Header';
import { Button } from '@/components/common/Button';
import Link from 'next/link';

function PollInfoBox({ title, children, className = '' }: { 
  title: string; 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | bigint | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium text-gray-900">{String(value)}</span>
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
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Poll Not Found</h1>
            <p className="mb-6 text-gray-600">The poll with ID "{pollId}" was not found.</p>
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-main flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {pollConfig.name || `Poll #${pollId}`}
            </h1>
            <p className="mt-2 text-gray-600">Poll ID: {pollId}</p>
          </div>
          <Link href="/polls">
            <Button variant="secondary">Back to Polls</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-3 text-gray-600">Loading poll data...</span>
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
              <InfoItem label="Poll Contract" value={formatAddress(pollConfig.pollContract)} />
              <InfoItem label="Message Processor" value={formatAddress(pollConfig.messageProcessor)} />
              <InfoItem label="Tally Contract" value={formatAddress(pollConfig.tally)} />
            </PollInfoBox>

            {/* External Contracts */}
            {extContracts && (
              <PollInfoBox title="External Contracts" className="md:col-span-2">
                <InfoItem label="MACI" value={formatAddress(extContracts.maci)} />
                <InfoItem label="Verifier" value={formatAddress(extContracts.verifier)} />
                <InfoItem label="Keys Registry" value={formatAddress(extContracts.verifyingKeysRegistry)} />
                <InfoItem label="Policy" value={formatAddress(extContracts.policy)} />
                <InfoItem label="Voice Credit Proxy" value={formatAddress(extContracts.initialVoiceCreditProxy)} />
              </PollInfoBox>
            )}

            {/* Coordinator */}
            {coordinatorPublicKey && (
              <PollInfoBox title="Coordinator Public Key" className="lg:col-span-1">
                <InfoItem label="X Coordinate" value={coordinatorPublicKey.x} />
                <InfoItem label="Y Coordinate" value={coordinatorPublicKey.y ?? 0} />
              </PollInfoBox>
            )}
          </div>
        )}
      </main>
    </div>
  );
}