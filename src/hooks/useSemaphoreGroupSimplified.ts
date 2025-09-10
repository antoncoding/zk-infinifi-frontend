import { useState, useEffect } from 'react';
import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import { 
  GroupJoinError
} from '@/types/semaphore';

type SemaphoreGroupHookResult = {
  group: Group | null;
  isGroupMember: boolean;
  totalMembers: number;
  loading: boolean;
  error: GroupJoinError | null;
};

/**
 * Simplified hook to manage Semaphore group operations
 * Avoids infinite re-renders by using minimal dependencies
 */
export function useSemaphoreGroup(userIdentity?: Identity): SemaphoreGroupHookResult {
  const [group, setGroup] = useState<Group | null>(null);
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GroupJoinError | null>(null);
  const [initialized, setInitialized] = useState(false);

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

  return {
    group,
    isGroupMember,
    totalMembers,
    loading,
    error,
  };
}