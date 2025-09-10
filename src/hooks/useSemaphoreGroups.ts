import { useState, useEffect, useCallback } from 'react';
import { Group } from '@semaphore-protocol/group';
import { 
  getMultipleGroupsFromSubgraph, 
  createGroupsFromSubgraphData,
  SubgraphGroup 
} from '@/lib/semaphore';

type UseSemaphoreGroupsResult = {
  groups: Record<string, Group>;
  subgraphGroups: Record<string, SubgraphGroup>;
  isLoading: boolean;
  error: Error | null;
  refetchAll: () => void;
};

type GroupIds = {
  whaleGroupId?: bigint;
  dolphinGroupId?: bigint;
  shrimpGroupId?: bigint;
};

/**
 * Hook to fetch multiple Semaphore groups from subgraph and create Group objects
 * Fetches all members for each group and creates proper Group objects for proof generation
 */
export function useSemaphoreGroups(groupIds: GroupIds): UseSemaphoreGroupsResult {
  const [groups, setGroups] = useState<Record<string, Group>>({});
  const [subgraphGroups, setSubgraphGroups] = useState<Record<string, SubgraphGroup>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = useCallback(async () => {
    // Filter out undefined group IDs and convert to strings
    const validGroupIds = Object.values(groupIds)
      .filter((id): id is bigint => id !== undefined)
      .map(id => id.toString());

    if (validGroupIds.length === 0) {
      setGroups({});
      setSubgraphGroups({});
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch groups from subgraph
      const fetchedSubgraphGroups = await getMultipleGroupsFromSubgraph(validGroupIds);
      
      // Create subgraph groups record
      const subgraphGroupsRecord: Record<string, SubgraphGroup> = {};
      fetchedSubgraphGroups.forEach(group => {
        subgraphGroupsRecord[group.id] = group;
      });

      // Create Group objects with all members
      const groupsRecord = createGroupsFromSubgraphData(fetchedSubgraphGroups);

      setSubgraphGroups(subgraphGroupsRecord);
      setGroups(groupsRecord);
    } catch (err) {
      console.error('Error fetching Semaphore groups:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setGroups({});
      setSubgraphGroups({});
    } finally {
      setIsLoading(false);
    }
  }, [groupIds.whaleGroupId, groupIds.dolphinGroupId, groupIds.shrimpGroupId]);

  const refetchAll = useCallback(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    subgraphGroups,
    isLoading,
    error,
    refetchAll,
  };
}