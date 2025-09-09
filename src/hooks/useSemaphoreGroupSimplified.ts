import { useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
// import { getSemaphoreConfig } from '@/config/semaphore';
import { 
  GroupJoinError
} from '@/types/semaphore';

type SemaphoreGroupHookResult = {
  group: Group | null;
  isGroupMember: boolean;
  totalMembers: number;
  joinGroup: (identity: Identity, signature: string) => Promise<boolean>;
  loading: boolean;
  error: GroupJoinError | null;
  isJoining: boolean;
};

/**
 * Simplified hook to manage Semaphore group operations
 * Avoids infinite re-renders by using minimal dependencies
 */
export function useSemaphoreGroup(userIdentity?: Identity): SemaphoreGroupHookResult {
  const { address } = useAccount();
  const [group, setGroup] = useState<Group | null>(null);
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<GroupJoinError | null>(null);
  const [initialized, setInitialized] = useState(false);

  // const config = getSemaphoreConfig(); // Not used in development mode

  // Single initialization effect
  useEffect(() => {
    if (initialized) return;

    const initializeGroup = async () => {
      try {
        setLoading(true);
        setError(null);

        // For development: create empty group when API is not available
        const emptyGroup = new Group([]);
        setGroup(emptyGroup);
        setTotalMembers(0);
        setIsGroupMember(false);
        setInitialized(true);
        
        console.log('Initialized empty Semaphore group for development');
      } catch {
        setError({
          type: 'API_ERROR',
          message: 'Failed to initialize group'
        });
      } finally {
        setLoading(false);
      }
    };

    void initializeGroup();
  }, [initialized]);

  // Update membership when user identity changes
  useEffect(() => {
    const commitment = userIdentity?.commitment.toString();
    if (commitment && group) {
      // For now, assume user is not a member since we don't have backend
      // In production, this would check the group members
      setIsGroupMember(false);
    } else {
      setIsGroupMember(false);
    }
  }, [userIdentity?.commitment.toString(), group]);

  // Join group function
  const joinGroup = useCallback(async (identity: Identity, signature: string): Promise<boolean> => {
    if (!address) {
      setError({
        type: 'IDENTITY_REQUIRED',
        message: 'Wallet not connected'
      });
      return false;
    }

    if (!identity) {
      setError({
        type: 'IDENTITY_REQUIRED',
        message: 'Identity required to join group'
      });
      return false;
    }

    try {
      setIsJoining(true);
      setError(null);

      // For development: simulate joining
      console.log('Simulating group join for development:', {
        commitment: identity.commitment.toString(),
        signature: signature.slice(0, 10) + '...'
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In development, mark user as joined
      setIsGroupMember(true);
      setTotalMembers(prev => prev + 1);
      
      return true;
    } catch {
      setError({
        type: 'API_ERROR',
        message: 'Simulated join for development'
      });
      return false;
    } finally {
      setIsJoining(false);
    }
  }, [address]);

  return {
    group,
    isGroupMember,
    totalMembers,
    joinGroup,
    loading,
    error,
    isJoining,
  };
}