import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { fetchFromApi } from '../lib/apiClient';

const TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

export function useAuthedApiQuery(queryKey, path, options = {}) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const isBrowser = typeof window !== 'undefined';

  return useQuery({
    queryKey,
    enabled: isBrowser && isLoaded && isSignedIn && (options.enabled ?? true),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      const token = await getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
      if (!token) {
        throw new Error('Missing API token for request');
      }
      return fetchFromApi(path, { token });
    },
    ...options,
  });
}
