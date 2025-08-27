'use client';

import React from 'react';
import Link from 'next/link';
import { HARDCODED_POLLS, type Poll } from '@/config/poll';
import { usePoll } from '@/hooks/usePoll';
import Header from '@/components/layout/header/Header';
import { Button, AddressBadge, PollStatusBadge } from '@/components/common';
import { formatPollStatus, getPollStatus } from '@/utils/timeFormat';

function PollCard({ poll }: { poll: Poll }) {
  const { 
    startDate,
    endDate,
    totalSignups,
    maxSignups,
    initialized,
    stateMerged,
    isLoading
  } = usePoll({ 
    address: poll.pollContract,
    refetchInterval: 10000 
  });



  const pollStatus = getPollStatus(initialized, startDate, endDate, stateMerged);
  const timelineStatus = initialized ? formatPollStatus(startDate, endDate) : 'Not scheduled';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {poll.name ?? `Poll #${poll.id}`}
          </h3>
          <p className="text-sm text-gray-600">ID: {poll.id}</p>
        </div>
        <PollStatusBadge status={pollStatus} />
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Poll Contract:</span>
          <AddressBadge address={poll.pollContract} />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Message Processor:</span>
          <AddressBadge address={poll.messageProcessor} />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tally Contract:</span>
          <AddressBadge address={poll.tally} />
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
            <span className="text-gray-600">Timeline:</span>
            <span className="text-sm">{timelineStatus}</span>
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