import { getClient } from "@/utils/rpc";
import { IPollJoiningArtifacts } from "node_modules/@maci-protocol/sdk/build/ts/proof/types";
import { Address, getContract } from "viem";
import { poolAbi } from "@/abis/poll";
import { SupportedNetworks } from "@/utils/networks";

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
        mode
        duration
        startDate
        endDate
        totalSignups
        numMessages
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


/**
 * Get the url of the poll joining artifacts
 *
 * @param testing - Whether to get the testing artifacts
 * @param stateTreeDepth - The depth of the state tree
 * @returns The url of the poll joining artifacts
 */
export const getPollJoiningArtifactsUrl = (testing: boolean, stateTreeDepth: number): { zKeyUrl: string; wasmUrl: string } => {
  if (testing) {
    return {
      zKeyUrl: `https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v3.0.0/browser-poll-join/testing/PollJoining_${stateTreeDepth}_test.0.zkey`,
      wasmUrl: `https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v3.0.0/browser-poll-join/testing/PollJoining_${stateTreeDepth}_test.wasm`,
    };
  }

  return {
    zKeyUrl: `https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v3.0.0/browser-poll-join/production/PollJoining_${stateTreeDepth}.0.zkey`,
    wasmUrl: `https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v3.0.0/browser-poll-join/production/PollJoining_${stateTreeDepth}.wasm`,
  };
};

/**
 * Download the poll joining artifacts for the browser
 *
 * @param args - The arguments to download the poll joining artifacts for the browser
 * @returns The poll joining artifacts
 */
export const downloadPollJoiningArtifactsBrowser = async ({
  testing = false,
  stateTreeDepth,
}: {
  testing: boolean;
  stateTreeDepth: number;
}): Promise<IPollJoiningArtifacts> => {
  const { zKeyUrl, wasmUrl } = getPollJoiningArtifactsUrl(testing, stateTreeDepth);

  const [zKeyResponse, wasmResponse] = await Promise.all([fetch(zKeyUrl), fetch(wasmUrl)]);

  const zKeyReader = zKeyResponse.body?.getReader();
  const wasmReader = wasmResponse.body?.getReader();

  if (!zKeyReader || !wasmReader) {
    throw new Error("Failed to read zKey or wasm");
  }

  const [zKey, wasm] = await Promise.all([readChunks(zKeyReader), readChunks(wasmReader)]);

  return { zKey, wasm };
};

/**
 * Read the chunks of a response
 *
 * @param response - The response to read the chunks from
 * @returns The chunks and the length
 */
const readChunks = async (reader: ReadableStreamDefaultReader<Uint8Array>): Promise<Uint8Array> => {
  let result = await reader.read();

  const chunks: Uint8Array[] = [];
  let length = 0;

  while (!result.done) {
    const { value } = result;

    length += value.length;
    chunks.push(value as unknown as Uint8Array);

    // continue reading
    // eslint-disable-next-line no-await-in-loop
    result = await reader.read();
  }

  const { acc: obj } = chunks.reduce(
    ({ acc, position }, chunk) => {
      acc.set(chunk, position);

      return { acc, position: position + chunk.length };
    },
    { acc: new Uint8Array(length), position: 0 },
  );

  return obj;
};

export async function hasUserJoinedPoll({ poolAddress, nullifier, chainId = SupportedNetworks.BaseSepolia }: { poolAddress: Address, chainId?: number, nullifier: bigint }) {
  
  const client = getClient(chainId);

  const contract = getContract({ address: poolAddress, abi: poolAbi, client })

  const joined = await contract.read.pollNullifiers([nullifier])

  return joined
}