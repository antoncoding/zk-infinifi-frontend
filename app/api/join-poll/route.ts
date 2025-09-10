import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { verifyMessage } from 'viem';
import { APP_SIGNATURE_MESSAGE, VOTING_CONTRACT_ADDRESS } from '@/config/semaphore';
import { abi as votingAbi } from '@/abis/voting';

// Types for request/response
type JoinPollRequest = {
  walletAddress: string;
  signature: string;
  identityCommitment: string;
  groupId: string;
};

type JoinPollResponse = {
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

// Function to verify if user qualifies to join the specific requested group
async function verifyUserQualificationForGroup(
  walletAddress: string, 
  requestedGroupId: string
): Promise<{ qualified: boolean; reason?: string }> {
  console.log(`🔍 Verifying qualification for wallet ${walletAddress} to join group ${requestedGroupId}`);
  
  // TODO: Implement actual token balance checking logic here
  // For now, we'll implement a basic mock that shows the intended logic
  
  try {
    // In a real implementation, you would:
    // 1. Read user's token balance from the blockchain
    // 2. Determine which tier they qualify for based on balance thresholds
    // 3. Validate that requestedGroupId matches their qualification tier
    
    // Mock token balance - in reality, read from blockchain
    const mockTokenBalance = BigInt(1000); // Replace with actual balance check
    
    // Mock group ID mappings - in reality, read from voting contract
    const MOCK_SHRIMP_GROUP_ID = "1";
    const MOCK_DOLPHIN_GROUP_ID = "2"; 
    const MOCK_WHALE_GROUP_ID = "3";
    
    // Mock tier thresholds - configure based on your tokenomics
    const SHRIMP_THRESHOLD = BigInt(100);
    const DOLPHIN_THRESHOLD = BigInt(1000);
    const WHALE_THRESHOLD = BigInt(10000);
    
    // Determine which groups user qualifies for (users can qualify for multiple)
    const qualifiesForShrimp = mockTokenBalance >= SHRIMP_THRESHOLD;
    const qualifiesForDolphin = mockTokenBalance >= DOLPHIN_THRESHOLD;
    const qualifiesForWhale = mockTokenBalance >= WHALE_THRESHOLD;
    
    console.log(`💰 User balance: ${mockTokenBalance.toString()}`);
    console.log(`📊 Qualifications: Shrimp=${qualifiesForShrimp}, Dolphin=${qualifiesForDolphin}, Whale=${qualifiesForWhale}`);
    
    // Validate the requested group
    switch (requestedGroupId) {
      case MOCK_SHRIMP_GROUP_ID:
        if (!qualifiesForShrimp) {
          return { 
            qualified: false, 
            reason: `Insufficient token balance for Shrimp group. Required: ${SHRIMP_THRESHOLD.toString()}, Current: ${mockTokenBalance.toString()}` 
          };
        }
        break;
        
      case MOCK_DOLPHIN_GROUP_ID:
        if (!qualifiesForDolphin) {
          return { 
            qualified: false, 
            reason: `Insufficient token balance for Dolphin group. Required: ${DOLPHIN_THRESHOLD.toString()}, Current: ${mockTokenBalance.toString()}` 
          };
        }
        break;
        
      case MOCK_WHALE_GROUP_ID:
        if (!qualifiesForWhale) {
          return { 
            qualified: false, 
            reason: `Insufficient token balance for Whale group. Required: ${WHALE_THRESHOLD.toString()}, Current: ${mockTokenBalance.toString()}` 
          };
        }
        break;
        
      default:
        return { 
          qualified: false, 
          reason: `Invalid group ID: ${requestedGroupId}. Valid groups: ${MOCK_SHRIMP_GROUP_ID}, ${MOCK_DOLPHIN_GROUP_ID}, ${MOCK_WHALE_GROUP_ID}` 
        };
    }
    
    console.log(`✅ User ${walletAddress} qualifies for group ${requestedGroupId}`);
    return { qualified: true };
    
  } catch (error) {
    console.error('Error checking user qualification:', error);
    return { 
      qualified: false, 
      reason: 'Failed to verify user qualifications. Please try again.' 
    };
  }
}

// Function to add user to Semaphore group via voting contract
async function addUserToSemaphoreGroup(
  identityCommitment: string,
  groupId: string,
  walletClient: ReturnType<typeof getWalletClient>
): Promise<string> {
  console.log(`Adding identity commitment ${identityCommitment} to group ${groupId} via voting contract`);
  
  // Encode the addMember function call
  const data = encodeFunctionData({
    abi: votingAbi,
    functionName: 'addMember',
    args: [BigInt(groupId), BigInt(identityCommitment)]
  });
  
  // Send transaction to voting contract
  const hash: string = await walletClient.sendTransaction({
    to: VOTING_CONTRACT_ADDRESS,
    data,
  });
  
  console.log(`AddMember transaction sent: ${hash}`);
  return hash;
}

export async function POST(request: NextRequest): Promise<NextResponse<JoinPollResponse>> {
  try {
    // Parse request body
    const body = await request.json() as JoinPollRequest;
    const { walletAddress, signature, identityCommitment, groupId } = body;
    
    // Validate required fields
    if (!walletAddress || !signature || !identityCommitment || !groupId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: walletAddress, signature, identityCommitment, groupId'
      }, { status: 400 });
    }
    
    console.log('Join poll request:', {
      walletAddress,
      identityCommitment: identityCommitment.slice(0, 10) + '...',
      groupId
    });
    
    // 1. Verify the signature
    try {
      const isValidSignature = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message: APP_SIGNATURE_MESSAGE,
        signature: signature as `0x${string}`,
      });
      
      if (!isValidSignature) {
        return NextResponse.json({
          success: false,
          error: 'Invalid signature'
        }, { status: 401 });
      }
      
      console.log('Signature verified successfully');
    } catch (signatureError) {
      console.error('Signature verification failed:', signatureError);
      return NextResponse.json({
        success: false,
        error: 'Signature verification failed'
      }, { status: 401 });
    }
    
    // 2. Verify user qualification for the specific requested group
    const qualification = await verifyUserQualificationForGroup(walletAddress, groupId);
    if (!qualification.qualified) {
      return NextResponse.json({
        success: false,
        error: qualification.reason ?? 'User not qualified for the requested group'
      }, { status: 403 });
    }
    
    console.log(`✅ User qualification verified for group ${groupId}`);
    
    // 3. Send transaction to add user to Semaphore group
    try {
      const walletClient = getWalletClient();
      const transactionHash = await addUserToSemaphoreGroup(
        identityCommitment,
        groupId,
        walletClient
      );
      
      // 4. Wait for transaction confirmation (optional - you might want to do this async)
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: transactionHash as `0x${string}` 
      });
      
      if (receipt.status === 'success') {
        console.log('Transaction confirmed successfully');
        return NextResponse.json({
          success: true,
          transactionHash
        });
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (txError) {
      console.error('Transaction failed:', txError);
      return NextResponse.json({
        success: false,
        error: 'Failed to add user to group: ' + (txError instanceof Error ? txError.message : 'Unknown error')
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Join poll API error:', error);
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