import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { fetchFromApi } from '../../../lib/apiClient';
import { useDebounce } from './useDebounce';
import { inviteSearchQueryKey, MIN_SEARCH_LENGTH } from './types';

const TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

export function useInviteSearch({ groupId, query, enabled = true }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const trimmedQuery = useMemo(() => query?.trim().toLowerCase() ?? '', [query]);
  const debouncedQuery = useDebounce(trimmedQuery, 300);
  const canSearch =
    Boolean(groupId) &&
    debouncedQuery.length >= MIN_SEARCH_LENGTH &&
    enabled &&
    isLoaded &&
    isSignedIn;

  return useQuery({
    queryKey: inviteSearchQueryKey(groupId, debouncedQuery),
    enabled: canSearch,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: [],
    queryFn: async () => {
      if (!groupId) {
        throw new Error('Missing group id for invite search');
      }
      const token = await getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
      if (!token) {
        throw new Error('Unable to fetch token for invite search');
      }
      const path = `/api/groups/${groupId}/invite/search?query=${encodeURIComponent(debouncedQuery)}`;
      return fetchFromApi(path, { token });
    },
  });
}
