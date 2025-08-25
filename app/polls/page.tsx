'use client';

import React from 'react';
import Link from 'next/link';
import { HARDCODED_POLLS, type PollConfig } from '@/config/poll';
import { usePoll } from '@/hooks/usePoll';
import Header from '@/components/layout/header/Header';
import { Button } from '@/components/common/Button';

function PollCard({ poll }: { poll: PollConfig }) {
  const { 
    startDate,
    endDate,
    totalSignups,
    maxSignups,
    initialized,
    isLoading
  } = usePoll({ 
    address: poll.pollContract,
    refetchInterval: 10000 
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return 'Not set';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getStatus = () => {
    if (!initialized) return { text: 'Not Initialized', color: 'text-gray-500' };
    
    const now = Date.now() / 1000;
    const start = Number(startDate);
    const end = Number(endDate);
    
    if (start > 0 && now < start) return { text: 'Upcoming', color: 'text-blue-600' };
    if (end > 0 && now > end) return { text: 'Ended', color: 'text-red-600' };
    if (start > 0 && now >= start && (end === 0 || now <= end)) return { text: 'Active', color: 'text-green-600' };
    
    return { text: 'Unknown', color: 'text-gray-500' };
  };

  const status = getStatus();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {poll.name ?? `Poll #${poll.id}`}
          </h3>
          <p className="text-sm text-gray-600">ID: {poll.id}</p>
        </div>
        <span className={`text-sm font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Poll Contract:</span>
          <span className="font-mono">{formatAddress(poll.pollContract)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Message Processor:</span>
          <span className="font-mono">{formatAddress(poll.messageProcessor)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tally Contract:</span>
          <span className="font-mono">{formatAddress(poll.tally)}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="mb-4 flex items-center justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-2 text-sm text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Participants:</span>
            <span>{String(totalSignups)} / {String(maxSignups ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Start Date:</span>
            <span>{formatTimestamp(startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">End Date:</span>
            <span>{formatTimestamp(endDate)}</span>
          </div>
        </div>
      )}

      <Link href={`/poll/${poll.id}`}>
        <Button variant="default" className="w-full">
          View Details
        </Button>
      </Link>
    </div>
  );
}

export default function PollsPage() {
  return (
    <div className="bg-main flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Polls</h1>
          <p className="text-gray-600">Browse and participate in available polls</p>
        </div>

        {HARDCODED_POLLS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-medium text-gray-900">No polls available</h3>
              <p className="text-gray-600">Check back later for new polls to participate in.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {HARDCODED_POLLS.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}