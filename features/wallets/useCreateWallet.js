import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '../../lib/apiClient';

const TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

export function useCreateWallet() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ currency = 'USD' } = {}) => {
      const token = await getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
      if (!token) {
        throw new Error('Unable to fetch auth token for wallet creation');
      }

      return fetchFromApi('/api/wallets', {
        token,
        method: 'POST',
        body: { currency },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'], exact: false });
    },
  });
}

export default useCreateWallet;
