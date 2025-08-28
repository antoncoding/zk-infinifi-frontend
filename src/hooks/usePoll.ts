import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { pollAbi } from '@/abis/poll';
import { SupportedNetworks } from '@/utils/networks';
import { PubKey } from '@maci-protocol/domainobjs';

type ExtContracts = {
  maci: Address;
  verifier: Address;
  verifyingKeysRegistry: Address;
  policy: Address;
  initialVoiceCreditProxy: Address;
};

type PollHookResult = {
  // Dates
  startDate: bigint;
  endDate: bigint;
  startAndEndDates: readonly [bigint, bigint] | undefined;

  // Poll configuration
  pollId: bigint;
  maxSignups: bigint;
  totalSignups: bigint;
  voteOptions: bigint;
  numMessages: bigint;

  // State
  initialized: boolean;
  stateMerged: boolean;

  // Coordinator
  coordinatorPublicKey: PubKey | undefined;

  // External contracts
  extContracts: ExtContracts | undefined;

  // Loading state
  isLoading: boolean;
};

type Props = {
  address: Address;
  refetchInterval?: number;
  chainId?: SupportedNetworks;
}

export function usePoll({
  address,
  chainId = SupportedNetworks.BaseSepolia,
  refetchInterval = 10000,
}: Props): PollHookResult {

  // Read start and end dates
  const { data: startAndEndDates } = useReadContract({
    abi: pollAbi,
    functionName: 'getStartAndEndDate',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId: chainId,
  });

  const { data: startDate } = useReadContract({
    abi: pollAbi,
    functionName: 'startDate',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId: chainId,
  });
  // console.log('startDate', startDate, chainId, address);

  const { data: endDate } = useReadContract({
    abi: pollAbi,
    functionName: 'endDate',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  const { data: pollId } = useReadContract({
    abi: pollAbi,
    functionName: 'pollId',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  const { data: maxSignups } = useReadContract({
    abi: pollAbi,
    functionName: 'maxSignups',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  const { data: totalSignups } = useReadContract({
    abi: pollAbi,
    functionName: 'totalSignups',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  const { data: initialized } = useReadContract({
    abi: pollAbi,
    functionName: 'initialized',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  const { data: stateMerged } = useReadContract({
    abi: pollAbi,
    functionName: 'stateMerged',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  const { data: voteOptions } = useReadContract({
    abi: pollAbi,
    functionName: 'voteOptions',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  const { data: numMessages } = useReadContract({
    abi: pollAbi,
    functionName: 'numMessages',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  // External contracts
  const { data: extContracts } = useReadContract({
    abi: pollAbi,
    functionName: 'extContracts',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });

  const { data: coordinatorPublicKeys } = useReadContract({
    abi: pollAbi,
    functionName: 'coordinatorPublicKey',
    address,
    query: {
      enabled: !!address,
      refetchInterval,
    },
    chainId,
  });
 
  const rawExtContracts = extContracts as readonly Address[] | undefined;
  const mappedExtContracts: ExtContracts | undefined = rawExtContracts
    ? {
        maci: rawExtContracts[0],
        verifier: rawExtContracts[1],
        verifyingKeysRegistry: rawExtContracts[2],
        policy: rawExtContracts[3],
        initialVoiceCreditProxy: rawExtContracts[4],
      }
    : undefined;

  const isLoading = startDate === undefined || endDate === undefined;

  return {
    // Dates
    startDate: ((startDate ?? BigInt(0)) as bigint),
    endDate: ((endDate ?? BigInt(0)) as bigint),
    startAndEndDates: (startAndEndDates as readonly [bigint, bigint] | undefined),

    // Poll configuration
    pollId: ((pollId ?? BigInt(0)) as bigint),
    maxSignups: ((maxSignups ?? BigInt(0)) as bigint),
    totalSignups: ((totalSignups ?? BigInt(0)) as bigint),
    voteOptions: ((voteOptions ?? BigInt(0)) as bigint),
    numMessages: ((numMessages ?? BigInt(0)) as bigint),

    // State
    initialized: ((initialized ?? false) as boolean),
    stateMerged: ((stateMerged ?? false) as boolean),

    // Coordinator
    coordinatorPublicKey: coordinatorPublicKeys ? new PubKey(coordinatorPublicKeys as [bigint, bigint]) : undefined,

    // External contracts
    extContracts: mappedExtContracts,

    // Loading state
    isLoading,
  };
}