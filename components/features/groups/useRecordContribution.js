import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '../../../lib/apiClient';

const TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

export function useRecordContribution() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, cycleId, amount, walletId }) => {
      if (!groupId || !cycleId || !amount) {
        throw new Error('Missing contribution details');
      }
      const token = await getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
      if (!token) {
        throw new Error('Unable to fetch auth token for contribution');
      }

      return fetchFromApi(`/api/groups/${encodeURIComponent(groupId)}/contributions`, {
        token,
        method: 'POST',
        body: {
          cycleId,
          amount,
          walletId,
          status: 'SUCCEEDED',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['groups'], exact: false });
    },
  });
}

export default useRecordContribution;
