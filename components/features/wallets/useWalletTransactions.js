import { useAuthedApiQuery } from '../../../hooks/useAuthedApiQuery';

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeTransaction = (transaction) => ({
  id: transaction.id,
  type: transaction.type,
  direction: transaction.direction,
  amount: toNumber(transaction.amount),
  currency: transaction.currency,
  status: transaction.status,
  createdAt: transaction.createdAt ?? transaction.date ?? null,
  relatedType: transaction.relatedType,
  relatedId: transaction.relatedId,
});

export function useWalletTransactions(walletId, options = {}) {
  return useAuthedApiQuery(
    ['wallets', walletId ?? 'unknown', 'transactions'],
    walletId ? `/api/wallets/${encodeURIComponent(walletId)}/transactions` : '/api/wallets/unknown/transactions',
    {
      enabled: Boolean(walletId) && (options.enabled ?? true),
      select: (data) => {
        if (!data) {
          return { wallet: null, transactions: [] };
        }
        const wallet = data.wallet ?? null;
        const transactions = Array.isArray(data.transactions) ? data.transactions : data.entries ?? [];
        return {
          wallet,
          transactions: transactions.map(normalizeTransaction),
        };
      },
      ...options,
    },
  );
}

export default useWalletTransactions;
