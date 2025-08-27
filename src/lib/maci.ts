// MACI configuration
export const MACI_CONFIG = {
  subgraphUrl: 'https://api.studio.thegraph.com/query/94369/maci/v0.0.1',
};

// =============================================================================
// MOCK MACI FUNCTIONS (Development only - replace with real MACI SDK later)
// =============================================================================

export async function mockDownloadArtifacts(): Promise<void> {
  // Simulate artifact download timing
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate occasional network error
  if (Math.random() < 0.1) {
    throw new Error('Network error: Failed to download artifacts');
  }
}

export async function mockSignUpToPoll(params: { 
  maciAddress: string; 
  pollId: bigint 
}): Promise<{ transactionHash: string; stateIndex: number; timestamp: number }> {
  // Simulate signup process timing
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Simulate occasional transaction error
  if (Math.random() < 0.1) {
    throw new Error('Signup failed: Transaction rejected');
  }

  return {
    transactionHash: '0x1234567890abcdef',
    stateIndex: Math.floor(Math.random() * 1000),
    timestamp: Date.now()
  };
}

export async function mockPublishMessage(params: { 
  pollId: bigint; 
  voteOptionIndex: bigint; 
  voteWeight: bigint; 
  nonce: bigint 
}): Promise<{ transactionHash: string; messageIndex: number; timestamp: number }> {
  // Simulate voting timing
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
  
  // Simulate occasional proof generation error
  if (Math.random() < 0.1) {
    throw new Error('Vote failed: Proof generation error');
  }

  return {
    transactionHash: '0xabcdef1234567890',
    messageIndex: Math.floor(Math.random() * 1000),
    timestamp: Date.now()
  };
}

// =============================================================================
// SUBGRAPH FUNCTIONS
// =============================================================================

export async function getPollFromSubgraph(pollId: string) {
  const query = `
    query GetPoll($pollId: String!) {
      poll(id: $pollId) {
        id
        pollId
        coordinatorPubKey
        mode
        duration
        startDate
        endDate
        numSignups
        numMessages
        voiceCreditFactor
        stateTreeDepth
        messageTreeDepth
        voteOptionTreeDepth
        messages {
          id
          msgChainLength
          timestamp
        }
        signups {
          id
          pubKey
          voiceCreditBalance
          timestamp
        }
      }
    }
  `;

  const response = await fetch(MACI_CONFIG.subgraphUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { pollId },
    }),
  });

  const data = await response.json();
  return data.data?.poll;
}

export async function hasUserJoinedPoll(
  pollId: string,
  userPubKey: string
): Promise<boolean> {
  const query = `
    query CheckUserSignup($pollId: String!, $pubKey: String!) {
      signups(where: { poll: $pollId, pubKey: $pubKey }) {
        id
      }
    }
  `;

  const response = await fetch(MACI_CONFIG.subgraphUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { pollId, pubKey: userPubKey },
    }),
  });

  const data = await response.json();
  return data.data?.signups?.length > 0;
}