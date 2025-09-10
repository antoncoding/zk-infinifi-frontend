import { useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import { getSemaphoreConfig, API_ENDPOINTS } from '@/config/semaphore';
import { 
  JoinGroupRequest, 
  JoinGroupResponse,
  GroupMembersResponse,
  GroupJoinError,
  SemaphoreGroupMember
} from '@/types/semaphore';

type SemaphoreGroupHookResult = {
  group: Group | null;
  isGroupMember: boolean;
  groupMembers: SemaphoreGroupMember[];
  totalMembers: number;
  joinGroup: (identity: Identity, signature: string) => Promise<boolean>;
  refreshGroupData: () => Promise<void>;
  loading: boolean;
  error: GroupJoinError | null;
  isJoining: boolean;
};

/**
 * @deprecated This hook uses hardcoded group IDs and is no longer used.
 * Use useUserVotingGroup + useSemaphoreJoinGroup instead for dynamic group management.
 * Hook to manage Semaphore group operations
 * Handles group membership, joining, and member data fetching
 */
export function useSemaphoreGroup(userIdentity?: Identity): SemaphoreGroupHookResult {
  const { address } = useAccount();
  const [group, setGroup] = useState<Group | null>(null);
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [groupMembers, setGroupMembers] = useState<SemaphoreGroupMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<GroupJoinError | null>(null);

  const config = getSemaphoreConfig();

  // Fetch group members from backend API
  const fetchGroupMembers = useCallback(async (): Promise<SemaphoreGroupMember[]> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.getGroupMembers}?groupId=${config.groupId}`);
      
      if (!response.ok) {
        // Return empty array if API not available yet (development mode)
        if (response.status === 404) {
          console.warn('Group members API not available yet, returning empty group');
          return [];
        }
        throw new Error(`Failed to fetch group members: ${response.statusText}`);
      }

      const data = await response.json() as GroupMembersResponse;
      return data.members;
    } catch (err) {
      // In development, return empty array if backend not available
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Backend API not available, using empty group for development');
        return [];
      }
      console.error('Error fetching group members:', err);
      throw err;
    }
  }, [config.groupId]);

  // Check if user is a group member
  const checkMembership = useCallback((members: SemaphoreGroupMember[], userCommitment?: string): boolean => {
    if (!userCommitment) return false;
    return members.some(member => member.commitment === userCommitment);
  }, []);

  // Refresh group data
  const refreshGroupData = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const members = await fetchGroupMembers();
      
      // Create group with fetched members
      const memberCommitments = members.map(m => BigInt(m.commitment));
      const newGroup = new Group(memberCommitments);
      
      setGroup(newGroup);
      setGroupMembers(members);
      setTotalMembers(members.length);

      // Check if current user is a member
      if (userIdentity) {
        const isMember = checkMembership(members, userIdentity.commitment.toString());
        setIsGroupMember(isMember);
      }
    } catch (err) {
      // Don't set error for development mode when API is not available
      if (!(err instanceof TypeError && err.message.includes('fetch'))) {
        setError({
          type: 'API_ERROR',
          message: err instanceof Error ? err.message : 'Failed to fetch group data'
        });
      }
      console.error('Error refreshing group data:', err);
      
      // Set empty group as fallback
      setGroup(new Group([]));
      setGroupMembers([]);
      setTotalMembers(0);
      setIsGroupMember(false);
    } finally {
      setLoading(false);
    }
  }, [loading, fetchGroupMembers]);

  // Stable refresh function that doesn't cause re-renders
  const stableRefresh = useCallback(() => {
    void refreshGroupData();
  }, [refreshGroupData]);

  // Join group via backend API
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

    if (isGroupMember) {
      setError({
        type: 'ALREADY_MEMBER',
        message: 'You are already a member of this group'
      });
      return false;
    }

    try {
      setIsJoining(true);
      setError(null);

      const joinRequest: JoinGroupRequest = {
        walletAddress: address,
        signature,
        identityCommitment: identity.commitment.toString(),
      };

      const response = await fetch(API_ENDPOINTS.joinGroup, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...joinRequest,
          groupId: config.groupId.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Join request failed: ${errorData}`);
      }

      const result = await response.json() as JoinGroupResponse;
      
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to join group');
      }

      // Refresh group data to reflect new membership
      stableRefresh();
      
      return true;
    } catch (err) {
      let errorType: GroupJoinError['type'] = 'API_ERROR';
      let errorMessage = 'Failed to join group';

      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorType = 'NETWORK_ERROR';
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }

      setError({ type: errorType, message: errorMessage });
      console.error('Error joining group:', err);
      return false;
    } finally {
      setIsJoining(false);
    }
  }, [address, isGroupMember, config.groupId]);

  // Initialize group data on mount only
  useEffect(() => {
    stableRefresh();
  }, [stableRefresh]);

  // Update membership status when user identity changes
  useEffect(() => {
    if (userIdentity && groupMembers.length >= 0) { // Allow for empty groups
      const isMember = checkMembership(groupMembers, userIdentity.commitment.toString());
      setIsGroupMember(isMember);
    } else {
      setIsGroupMember(false);
    }
  }, [userIdentity?.commitment.toString(), groupMembers.length, checkMembership]); // More specific dependencies

  return {
    group,
    isGroupMember,
    groupMembers,
    totalMembers,
    joinGroup,
    refreshGroupData,
    loading,
    error,
    isJoining,
  };
}