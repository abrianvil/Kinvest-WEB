import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '../../lib/apiClient';

const TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

export function useCreateGroup() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['groups', 'create'],
    mutationFn: async (payload) => {
      const token = await getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
      if (!token) {
        throw new Error('Unable to fetch auth token for creating a group');
      }

      return fetchFromApi('/api/groups', {
        token,
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
    },
  });
}
