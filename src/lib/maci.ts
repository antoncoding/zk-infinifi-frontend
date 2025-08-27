// MACI configuration
export const MACI_CONFIG = {
  subgraphUrl: 'https://api.studio.thegraph.com/query/94369/maci/v0.0.1',
};

// =============================================================================
// SUBGRAPH HELPER FUNCTIONS
// =============================================================================

async function makeSubgraphRequest(query: string, variables: Record<string, any>) {
  const response = await fetch(MACI_CONFIG.subgraphUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`Subgraph request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Subgraph query error: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
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

  const data = await makeSubgraphRequest(query, { pollId });
  return data?.poll;
}

// Check if user is registered on MACI by public key coordinates
export async function isUserRegisteredOnMaci(pubKeyX: bigint, pubKeyY: bigint): Promise<boolean> {
  try {
    // Convert bigints to strings and concatenate for the user ID
    const xHex = pubKeyX.toString();
    const yHex = pubKeyY.toString();
    const userId = `${xHex} ${yHex}`;

    const query = `
      query GetUser($userId: String!) {
        user(id: $userId) {
          id
        }
      }
    `;

    const data = await makeSubgraphRequest(query, { userId });
    return data?.user !== null && data?.user !== undefined;
  } catch (error) {
    console.error('Error checking user registration:', error);
    return false;
  }
}

// Legacy function for backward compatibility - will be removed
export async function hasUserJoinedPoll(
  pollId: string,
  userPubKey: string
): Promise<boolean> {
  // This is a placeholder - in the real implementation, we would need to parse
  // the userPubKey and extract x,y coordinates, then use isUserRegisteredOnMaci
  console.warn('hasUserJoinedPoll is deprecated, use isUserRegisteredOnMaci instead');
  return false;
}