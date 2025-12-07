import { useAuthedApiQuery } from '../../hooks/useAuthedApiQuery';

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeWallet = (wallet) => ({
  id: wallet.id,
  currency: wallet.currency,
  availableBalance: toNumber(wallet.availableBalance),
  pendingBalance: toNumber(wallet.pendingBalance),
  status: wallet.status ?? 'ACTIVE',
  createdAt: wallet.createdAt ?? null,
});

export function useWallets(options = {}) {
  return useAuthedApiQuery(['wallets'], '/api/wallets', {
    staleTime: 30 * 1000,
    select: (data) => {
      if (Array.isArray(data)) {
        return data.map(normalizeWallet);
      }
      return [];
    },
    ...options,
  });
}

export default useWallets;
