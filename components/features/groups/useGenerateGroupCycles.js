import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { fetchFromApi } from '../../../lib/apiClient';

const TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

export function useGenerateGroupCycles() {
  const { getToken } = useAuth();

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
  });
}

export default useGenerateGroupCycles;
