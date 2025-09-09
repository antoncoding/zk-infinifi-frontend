import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { VOTING_CONTRACT_ADDRESS } from '@/config/semaphore';
import { abi as votingAbi } from '@/abis/voting';

// Types for request/response
type SubmitVoteRequest = {
  vote: number;
  proof: {
    merkleTreeDepth: number;
    merkleTreeRoot: string;
    nullifier: string;
    message: string;
    points: string[];
  };
  nullifier: string;
  groupId: string;
};

type SubmitVoteResponse = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};

// Create public client for reading blockchain data - always use Base Sepolia
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Create wallet client for sending transactions - always use Base Sepolia
const getWalletClient = () => {
  const privateKey = process.env.BACKEND_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error('BACKEND_PRIVATE_KEY environment variable is required');
  }
  
  const account = privateKeyToAccount(privateKey);
  
  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });
};

// Function to submit vote to voting contract
async function submitVoteToContract(
  proof: SubmitVoteRequest['proof'],
  groupId: string,
  walletClient: ReturnType<typeof getWalletClient>
): Promise<string> {
  if (VOTING_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error('Voting contract address not configured. Please set NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS environment variable.');
  }
  
  console.log(`Submitting vote to contract with proof for group ${groupId}`);
  
  // Encode the vote function call
  const data = encodeFunctionData({
    abi: votingAbi,
    functionName: 'vote',
    args: [
      BigInt(proof.merkleTreeDepth),
      BigInt(proof.merkleTreeRoot),
      BigInt(proof.nullifier),
      BigInt(proof.message),
      BigInt(groupId),
      proof.points.map(p => BigInt(p)) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]
    ]
  });
  
  // Send transaction to voting contract
  const hash: string = await walletClient.sendTransaction({
    to: VOTING_CONTRACT_ADDRESS,
    data,
  });
  
  console.log(`Vote transaction sent: ${hash}`);
  return hash;
}

export async function POST(request: NextRequest): Promise<NextResponse<SubmitVoteResponse>> {
  console.log('🚀 Vote API called');
  try {
    // Parse request body
    const body = await request.json() as SubmitVoteRequest;
    const { vote, proof, nullifier, groupId } = body;
    
    console.log('📝 Vote API received:', {
      vote,
      groupId,
      nullifier: nullifier?.slice(0, 10) + '...',
      proofKeys: Object.keys(proof || {}),
      proof: proof ? {
        merkleTreeDepth: proof.merkleTreeDepth,
        merkleTreeRoot: proof.merkleTreeRoot?.slice(0, 10) + '...',
        nullifier: proof.nullifier?.slice(0, 10) + '...',
        message: proof.message,
        pointsLength: proof.points?.length
      } : null
    });
    
    // Validate required fields
    if (vote === undefined || !proof || !nullifier || !groupId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: vote, proof, nullifier, groupId'
      }, { status: 400 });
    }
    
    console.log('Vote submission request:', {
      vote,
      groupId,
      nullifier: nullifier.slice(0, 10) + '...'
    });
    
    // Submit vote to contract
    try {
      const walletClient = getWalletClient();
      const transactionHash = await submitVoteToContract(
        proof,
        groupId,
        walletClient
      );
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: transactionHash as `0x${string}` 
      });
      
      if (receipt.status === 'success') {
        console.log('Vote transaction confirmed successfully');
        return NextResponse.json({
          success: true,
          transactionHash
        });
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (txError) {
      console.error('Vote transaction failed:', txError);
      return NextResponse.json({
        success: false,
        error: 'Failed to submit vote: ' + (txError instanceof Error ? txError.message : 'Unknown error')
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Vote submission API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}