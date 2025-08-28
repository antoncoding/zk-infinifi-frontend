import { getClient } from "@/utils/rpc";
import { IPollJoiningArtifacts } from "node_modules/@maci-protocol/sdk/build/ts/proof/types";
import { Address, getContract } from "viem";
import { pollAbi } from "@/abis/poll";
import { SupportedNetworks } from "@/utils/networks";
import { groth16, type PublicSignals, type Groth16Proof, zKey } from "snarkjs";
import { poseidon } from "@maci-protocol/crypto";
import { Keypair } from "@maci-protocol/domainobjs";

export type TCircuitInputs = Record<string, string | bigint | bigint[] | bigint[][] | string[] | bigint[][][]>;

// default Initial Voice Credit Proxy data
export const DEFAULT_IVCP_DATA = "0x0000000000000000000000000000000000000000000000000000000000000000"

export const DEFAULT_SIGNUP_POLICY_DATA = "0x0000000000000000000000000000000000000000000000000000000000000000"

// MACI configuration
export const MACI_CONFIG = {
  subgraphUrl: 'https://api.studio.thegraph.com/query/94369/maci/v0.0.2',
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

// Get all SignUp events from subgraph in chronological order
export async function getAllSignUpEvents(maciAddress: string): Promise<SignUpEvent[]> {
  const query = `
    query GetAllSignUps($maciAddress: String!) {
      signupEvents(
        where: { maci: $maciAddress }
        orderBy: timestamp
        orderDirection: asc
      ) {
        id
        publicKeyX
        publicKeyY
        timestamp
      }
    }
  `;

  const data = await makeSubgraphRequest(query, { maciAddress: maciAddress.toLowerCase() });
  return data?.signupEvents ?? [];
}

type SignUpEvent = {
  id: string;
  publicKeyX: string;
  publicKeyY: string;
  timestamp: string;
};

type MerkleProof = {
  siblings: bigint[];
  index: number;
  root: bigint;
};

// =============================================================================
// MERKLE TREE IMPLEMENTATION
// =============================================================================

// Hash function for left-right combination (same as MACI)
const hashLeftRight = (left: bigint, right: bigint): bigint => {
  return poseidon([left, right]);
};

// Padding key hash (hash of [0, 0])
const PAD_KEY_HASH = poseidon([0n, 0n]);

class SimpleMerkleTree {
  private leaves: bigint[] = [];
  private treeDepth: number;

  constructor(treeDepth: number) {
    this.treeDepth = treeDepth;
    // Insert padding key hash first (like MACI does)
    this.leaves.push(PAD_KEY_HASH);
  }

  insert(leaf: bigint): void {
    this.leaves.push(leaf);
  }

  generateProof(leafIndex: number): MerkleProof {
    if (leafIndex >= this.leaves.length) {
      throw new Error("Leaf index out of bounds");
    }

    const siblings: bigint[] = [];
    let currentIndex = leafIndex;
    let currentLevel = [...this.leaves];

    // Build tree level by level and collect siblings
    while (currentLevel.length > 1) {
      const nextLevel: bigint[] = [];
      const isOdd = currentIndex % 2 === 1;
      
      // Add sibling
      if (isOdd) {
        siblings.push(currentLevel[currentIndex - 1]);
      } else {
        const siblingIndex = currentIndex + 1;
        siblings.push(siblingIndex < currentLevel.length ? currentLevel[siblingIndex] : 0n);
      }

      // Build next level
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : 0n;
        nextLevel.push(hashLeftRight(left, right));
      }

      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    // Pad siblings array to tree depth
    while (siblings.length < this.treeDepth) {
      siblings.push(0n);
    }

    return {
      siblings: siblings.slice(0, this.treeDepth),
      index: leafIndex,
      root: currentLevel[0],
    };
  }

  getRoot(): bigint {
    let currentLevel = [...this.leaves];
    
    while (currentLevel.length > 1) {
      const nextLevel: bigint[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : 0n;
        nextLevel.push(hashLeftRight(left, right));
      }
      currentLevel = nextLevel;
    }
    
    return currentLevel[0];
  }
}

// Build state tree from SignUp events and generate proof for user
export async function buildStateTreeAndGetProof(
  userPubKeyX: bigint,
  userPubKeyY: bigint,
  stateTreeDepth: number,
  maciAddress: string
): Promise<{ proof: MerkleProof; userStateIndex: number }> {
  // Fetch all SignUp events in order
  const signUpEvents = await getAllSignUpEvents(maciAddress);

  // Create merkle tree
  const tree = new SimpleMerkleTree(stateTreeDepth);
  
  let userStateIndex = -1;
  
  // Process events in order (they should already be ordered by timestamp)
  signUpEvents.forEach((event, index) => {
    const pubKeyX = BigInt(event.publicKeyX);
    const pubKeyY = BigInt(event.publicKeyY);
    
    // Check if this is our user's public key
    if (pubKeyX === userPubKeyX && pubKeyY === userPubKeyY) {
      // Add 1 because index 0 is the padding key
      userStateIndex = index + 1;
    }
    
    // Insert into tree (hash the public key coordinates)
    const leafHash = hashLeftRight(pubKeyX, pubKeyY);
    tree.insert(leafHash);
  });
  
  if (userStateIndex === -1) {
    throw new Error("User not found in state tree");
  }
  
  // Generate proof for user's position
  const proof = tree.generateProof(userStateIndex);
  
  return {
    proof,
    userStateIndex,
  };
}

// Create circuit inputs for poll joining (simplified version)
export function createJoiningCircuitInputs(
  proof: MerkleProof,
  stateTreeDepth: number,
  userPrivateKey: bigint,
  userPubKeyX: bigint,
  userPubKeyY: bigint,
  pollId: bigint
): TCircuitInputs {
  // Pad siblings to state tree depth
  const siblings = [...proof.siblings];
  while (siblings.length < stateTreeDepth) {
    siblings.push(0n);
  }
  
  // Convert to format expected by circuit (array of arrays)
  const siblingsArray = siblings.map(sibling => [sibling]);
  
  // Create nullifier from private key and poll ID
  const nullifier = poseidon([userPrivateKey, pollId]);
  
  // Actual state tree depth is the number of non-zero siblings
  const actualStateTreeDepth = BigInt(proof.siblings.filter(s => s !== 0n).length);
  
  const circuitInputs = {
    privateKey: userPrivateKey,
    pollPublicKey: [userPubKeyX, userPubKeyY],
    siblings: siblingsArray,
    index: BigInt(proof.index),
    nullifier: nullifier,
    stateRoot: proof.root,
    actualStateTreeDepth: actualStateTreeDepth,
    pollId: pollId,
  };
  
  return circuitInputs;
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

// Generate join proof using simplified logic
export const generateJoinProof = async ({
  maciKeypair,
  pollId,
  stateTreeDepth,
  maciAddress,
  zkeyPath,
  wasmPath
}: {
  maciKeypair: Keypair;
  pollId: bigint;
  stateTreeDepth: number;
  maciAddress: string;
  zkeyPath: string;
  wasmPath: string;
}) => {

  const userPubKeyX = BigInt(maciKeypair.pubKey.asContractParam().x);
  const userPubKeyY = BigInt(maciKeypair.pubKey.asContractParam().y);

  console.log('building state tree from events')

  // Build state tree and get proof for user
  const { proof } = await buildStateTreeAndGetProof(
    userPubKeyX,
    userPubKeyY,
    stateTreeDepth,
    maciAddress
  );

  console.log('buildStateTreeAndGetProof', proof)
  
  // Create circuit inputs
  const circuitInputs = createJoiningCircuitInputs(
    proof,
    stateTreeDepth,
    BigInt(maciKeypair.privKey.asCircuitInputs()), // private key
    userPubKeyX,
    userPubKeyY,
    pollId
  );

  console.log('circuitInputs', circuitInputs)
  
  // Generate the zk proof
  const { proof: zkProof, publicSignals } = await groth16.fullProve(
    circuitInputs,
    wasmPath,
    zkeyPath
  );
  
  return { 
    proof: formatProofForVerifierContract(zkProof), 
    publicSignals,
    circuitInputs,
    nullifier: circuitInputs.nullifier as string,
    stateRoot: proof.root
  };
}

/** Format a SnarkProof type to an array of strings
 * which can be passed to the Groth16 verifier contract.
 */
export function formatProofForVerifierContract(proof: any): string[] {
  return [
    proof.pi_a[0].toString(),
    proof.pi_a[1].toString(), 
    proof.pi_b[0][1].toString(),
    proof.pi_b[0][0].toString(),
    proof.pi_b[1][1].toString(),
    proof.pi_b[1][0].toString(),
    proof.pi_c[0].toString(),
    proof.pi_c[1].toString()
  ];
}

