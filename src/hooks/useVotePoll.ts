import { Address, encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';
import { pollAbi } from '@/abis/poll';
import { SupportedNetworks } from '@/utils/networks';
import { Keypair, PCommand } from '@maci-protocol/domainobjs';
import { EcdhSharedKey } from '@maci-protocol/crypto';
import { useTransactionWithToast } from './useTransactionWithToast';
import { useUserNonce } from './useUserNonce';
import { usePollSharedData } from './usePollSharedData';
import { useCallback, useMemo } from 'react';
import { genEcdhSharedKey } from "@maci-protocol/crypto";
import { useMaciUserStats } from './useMaciUserStats';
import { MACI_CONTRACT_ADDRESS } from '@/config/poll';

type VotePollHookResult = {
  hasJoined: boolean;
  nullifier: bigint | null;
  vote: (voteOptionIndex: number) => Promise<void>;
  isConfirming: boolean;
  isConfirmed: boolean;
  sharedECDHKey: EcdhSharedKey | undefined;
  stateIndex: number | undefined;
};

type Props = {
  poll: Address;
  pollId: bigint;
  keyPair: Keypair | null;
  refetchInterval?: number;
  chainId?: SupportedNetworks;
  onTransactionSuccess?: () => void;
}

export function useVotePoll({
  poll,
  pollId,
  keyPair,
  chainId = SupportedNetworks.BaseSepolia,
  onTransactionSuccess,
}: Props): VotePollHookResult {
  
  const { address } = useAccount();
  const { getUserNonce, incrementUserNonce } = useUserNonce();

  const { stateIndex } = useMaciUserStats({
    maci: MACI_CONTRACT_ADDRESS,
    keyPair: keyPair,
  });

  // Use shared data hook instead of individual calls
  const { hasJoined, nullifier, coordinatorPublicKey } = usePollSharedData({
    poll,
    pollId,
    keyPair,
    refetchInterval: 30000, // Increased to 30 seconds
    chainId,
  });

  console.log('stateIndex', coordinatorPublicKey, stateIndex)

  // Calculate shared ECDH key with coordinator
  const sharedECDHKey = useMemo(() => {
    if (!coordinatorPublicKey || !keyPair?.privKey) return undefined

    return genEcdhSharedKey(keyPair?.privKey.rawPrivKey, coordinatorPublicKey.rawPubKey)
  }, [coordinatorPublicKey, keyPair])

  const { sendTransactionAsync, isConfirming, isConfirmed } = useTransactionWithToast({
    toastId: 'vote-poll',
    pendingText: `Vote Pending`,
    successText: 'Vote Success',
    errorText: 'Vote Error',
    chainId,
    pendingDescription: `Casting vote for Poll ${pollId}`,
    successDescription: `Successfully voted in Poll ${pollId}`,
    onSuccess: onTransactionSuccess,
  });

  const vote = useCallback(async(voteOptionIndex: number) => {
    if (!keyPair || !nullifier || !coordinatorPublicKey || !address) {
      throw new Error('Required data not available for voting');
    }

    if (!hasJoined) {
      throw new Error('Must join poll before voting');
    }

    if (stateIndex === null || stateIndex === undefined) {
      throw new Error('State index not available');
    }

    // Create the vote command
    const command = new PCommand(
      BigInt(stateIndex), // stateIndex
      keyPair.pubKey, // newPubKey (user's public key)
      BigInt(voteOptionIndex), // voteOptionIndex
      BigInt(1), // newVoteWeight (typically 1 for simple votes)
      getUserNonce(address!, pollId), // nonce (user's secret counter)
      pollId,
    );

    // Sign the command with user's private key
    const signature = command.sign(keyPair.privKey);

    // Generate temporary keypair for message encryption
    const ephemeralKeypair = new Keypair();
    
    // Generate shared key between ephemeral private key and coordinator public key
    const messageSharedKey = genEcdhSharedKey(
      ephemeralKeypair.privKey.rawPrivKey, 
      coordinatorPublicKey.rawPubKey
    );

    // Encrypt the command to create a message
    const message = command.encrypt(signature, messageSharedKey);

    // Send transaction
    await sendTransactionAsync({
      account: address,
      to: poll,
      data: encodeFunctionData({
        abi: pollAbi,
        functionName: 'publishMessage',
        args: [
          message.asContractParam(),
          ephemeralKeypair.pubKey.asContractParam(),
        ],
      }),
      chainId,
    });

    // Increment user's nonce after successful transaction
    incrementUserNonce(address, pollId);
  }, [
    keyPair, 
    nullifier, 
    coordinatorPublicKey, 
    address, 
    hasJoined, 
    stateIndex, 
    pollId, 
    poll, 
    sendTransactionAsync, 
    chainId,
    getUserNonce,
    incrementUserNonce
  ])

  return {
    hasJoined,
    nullifier,
    vote,
    isConfirming,
    isConfirmed,
    sharedECDHKey,
    stateIndex: stateIndex ? Number(stateIndex) : undefined,
  };
}