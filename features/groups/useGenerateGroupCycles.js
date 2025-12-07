import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '../../lib/apiClient';
import { groupDetailsQueryKey } from './useGroupDetails';

const TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

export function useGenerateGroupCycles() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, startDate, iterations, receiverOrder }) => {
      if (!groupId) {
        throw new Error('Missing group id for cycle generation');
      }
      const token = await getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
      if (!token) {
        throw new Error('Unable to fetch auth token for cycle generation');
      }

      const payload = {};
      if (startDate) payload.startDate = startDate;
      if (iterations) payload.iterations = iterations;
      if (receiverOrder) payload.receiverOrder = receiverOrder;

      return fetchFromApi(`/api/groups/${encodeURIComponent(groupId)}/cycles/generate`, {
        token,
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: (_data, variables) => {
      const groupId = variables?.groupId ?? null;
      queryClient.invalidateQueries({ queryKey: ['groups'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupDetailsQueryKey(groupId), exact: false });
      }
    },
  });
}

export default useGenerateGroupCycles;
