import { Group } from '@semaphore-protocol/group';
import { SEMAPHORE_SUBGRAPH_URL } from '@/config/semaphore';

// =============================================================================
// TYPES
// =============================================================================

export type SubgraphGroup = {
  id: string;
  timestamp: string;
  admin: string;
  merkleTree: {
    id: string;
    depth: number;
    root: string;
    size: number;
  };
  members: SubgraphMember[];
};

export type SubgraphMember = {
  id: string;
  timestamp: string;
  identityCommitment: string;
  index: number;
};

// =============================================================================
// SUBGRAPH HELPER FUNCTIONS
// =============================================================================

async function makeSemaphoreSubgraphRequest(query: string, variables: Record<string, any>) {
  const response = await fetch(SEMAPHORE_SUBGRAPH_URL, {
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
    throw new Error(`Semaphore subgraph request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Semaphore subgraph query error: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

// =============================================================================
// SUBGRAPH QUERY FUNCTIONS
// =============================================================================

export async function getGroupFromSubgraph(groupId: string): Promise<SubgraphGroup | null> {
  const query = `
    query GetGroup($groupId: String!) {
      group(id: $groupId) {
        id
        timestamp
        admin
        merkleTree {
          id
          depth
          root
          size
        }
        members(orderBy: index, orderDirection: asc) {
          id
          timestamp
          identityCommitment
          index
        }
      }
    }
  `;

  const data = await makeSemaphoreSubgraphRequest(query, { groupId });
  return data?.group ?? null;
}

export async function getMultipleGroupsFromSubgraph(groupIds: string[]): Promise<SubgraphGroup[]> {
  if (groupIds.length === 0) return [];

  const query = `
    query GetMultipleGroups($groupIds: [String!]!) {
      groups(where: { id_in: $groupIds }) {
        id
        timestamp
        admin
        merkleTree {
          id
          depth
          root
          size
        }
        members(orderBy: index, orderDirection: asc) {
          id
          timestamp
          identityCommitment
          index
        }
      }
    }
  `;

  const data = await makeSemaphoreSubgraphRequest(query, { groupIds });
  return data?.groups ?? [];
}

export async function isUserMemberOfGroup(groupId: string, userCommitment: bigint): Promise<boolean> {
  const query = `
    query CheckMembership($groupId: String!, $commitment: String!) {
      members(where: { group: $groupId, identityCommitment: $commitment }) {
        id
      }
    }
  `;

  const data = await makeSemaphoreSubgraphRequest(query, { 
    groupId, 
    commitment: userCommitment.toString() 
  });
  
  return (data?.members?.length ?? 0) > 0;
}

// =============================================================================
// GROUP CREATION FUNCTIONS
// =============================================================================

export function createGroupFromSubgraphData(subgraphGroup: SubgraphGroup): Group {
  // Sort members by index to ensure proper order
  const sortedMembers = [...subgraphGroup.members].sort((a, b) => a.index - b.index);
  
  // Extract commitments as bigints
  const commitments = sortedMembers.map(member => BigInt(member.identityCommitment));
  
  // Create Group object with all members
  return new Group(commitments);
}

export function createGroupsFromSubgraphData(subgraphGroups: SubgraphGroup[]): Record<string, Group> {
  const groups: Record<string, Group> = {};
  
  for (const subgraphGroup of subgraphGroups) {
    groups[subgraphGroup.id] = createGroupFromSubgraphData(subgraphGroup);
  }
  
  return groups;
}