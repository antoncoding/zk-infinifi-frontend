import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { ALLOCATION_VOTING } from '@/config/semaphore';
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
  details?: string;
  originalError?: string;
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
  if (ALLOCATION_VOTING === '0x0000000000000000000000000000000000000000') {
    throw new Error('Voting contract address not configured. Please set NEXT_PUBLIC_ALLOCATION_VOTING environment variable.');
  }
  
  console.log(`📋 Contract call details:`);
  console.log(`  Contract Address: ${ALLOCATION_VOTING}`);
  console.log(`  Group ID: ${groupId}`);
  console.log(`  Merkle Tree Depth: ${proof.merkleTreeDepth}`);
  console.log(`  Merkle Tree Root: ${proof.merkleTreeRoot}`);
  console.log(`  Nullifier: ${proof.nullifier}`);
  console.log(`  Message: ${proof.message}`);
  console.log(`  Points: [${proof.points.join(', ')}]`);
  
  const contractArgs = [
    BigInt(proof.merkleTreeDepth),
    BigInt(proof.merkleTreeRoot),
    BigInt(proof.nullifier),
    BigInt(proof.message),
    BigInt(groupId),
    proof.points.map(p => BigInt(p)) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]
  ];
  
  console.log(`🔧 Contract arguments converted to BigInt:`);
  console.log(`  merkleTreeDepth: ${contractArgs[0]}`);
  console.log(`  merkleTreeRoot: ${contractArgs[1]}`);
  console.log(`  nullifier: ${contractArgs[2]}`);
  console.log(`  message: ${contractArgs[3]}`);
  console.log(`  groupId: ${contractArgs[4]}`);
  console.log(`  points: [${(contractArgs[5] as bigint[]).map(p => p.toString()).join(', ')}]`);
  
  // TODO: update to most up to date ABI

  // Encode the vote function call
  const data = encodeFunctionData({
    abi: votingAbi,
    functionName: 'vote',
    args: contractArgs
  });
  
  console.log(`📝 Encoded transaction data: ${data}`);
  
  // Send transaction to voting contract
  const hash: string = await walletClient.sendTransaction({
    to: ALLOCATION_VOTING,
    data,
  });
  
  console.log(`✅ Vote transaction sent: ${hash}`);
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
      console.log('🏗️  Creating wallet client...');
      const walletClient = getWalletClient();
      console.log('✅ Wallet client created successfully');
      
      console.log('📤 Submitting vote to smart contract...');
      const transactionHash = await submitVoteToContract(
        proof,
        groupId,
        walletClient
      );
      
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: transactionHash as `0x${string}` 
      });
      
      console.log(`📊 Transaction receipt:`, {
        status: receipt.status,
        blockNumber: receipt.blockNumber?.toString(),
        gasUsed: receipt.gasUsed?.toString(),
        transactionHash: receipt.transactionHash
      });
      
      if (receipt.status === 'success') {
        console.log('✅ Vote transaction confirmed successfully');
        return NextResponse.json({
          success: true,
          transactionHash
        });
      } else {
        console.error('❌ Transaction failed with status:', receipt.status);
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }
      
    } catch (txError) {
      console.error('❌ Vote transaction failed:', txError);
      
      // Parse error message to provide more specific feedback
      let errorMessage = 'Failed to submit vote';
      let errorDetails = '';
      
      if (txError instanceof Error) {
        const errorMsg = txError.message.toLowerCase();
        
        if (errorMsg.includes('insufficient funds') || errorMsg.includes('insufficient balance')) {
          errorMessage = 'Transaction failed: Insufficient funds for gas fees';
          errorDetails = 'The backend wallet does not have enough funds to pay for transaction gas fees.';
        } else if (errorMsg.includes('nonce') || errorMsg.includes('replacement')) {
          errorMessage = 'Transaction failed: Nonce or replacement issue';
          errorDetails = 'The transaction nonce is incorrect or a replacement transaction is required.';
        } else if (errorMsg.includes('reverted') || errorMsg.includes('execution reverted')) {
          errorMessage = 'Smart contract execution failed';
          errorDetails = 'The voting contract rejected the transaction. This could be due to: already voted, invalid proof, or contract state issues.';
        } else if (errorMsg.includes('invalid proof') || errorMsg.includes('proof')) {
          errorMessage = 'Invalid voting proof';
          errorDetails = 'The generated proof is invalid or incompatible with the contract.';
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          errorMessage = 'Network connection error';
          errorDetails = 'Unable to connect to the blockchain network. Please try again.';
        } else {
          errorMessage = `Transaction error: ${txError.message}`;
        }
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        originalError: txError instanceof Error ? txError.message : 'Unknown error'
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