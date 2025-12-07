import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { AppLayout } from '../components/layouts';
import { useWallets, useWalletTransactions, useCreateWallet } from '../features/wallets';
import { formatCurrency } from '../utils/formatters';

function WalletsPage({ user }) {
  const walletsQuery = useWallets();
  const wallets = walletsQuery.data ?? [];
  const [activeWalletId, setActiveWalletId] = useState('');
  const [currencyInput, setCurrencyInput] = useState('USD');
  const [createError, setCreateError] = useState('');
  const createWallet = useCreateWallet();

  useEffect(() => {
    if (!activeWalletId && wallets.length) {
      setActiveWalletId(wallets[0].id);
    }
  }, [wallets, activeWalletId]);

  const activeWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === activeWalletId) ?? wallets[0] ?? null,
    [wallets, activeWalletId],
  );

  const transactionsQuery = useWalletTransactions(activeWallet?.id, {
    enabled: Boolean(activeWallet?.id),
  });

  const handleCreateWallet = async (event) => {
    event.preventDefault();
    setCreateError('');
    const trimmed = currencyInput.trim().toUpperCase();
    if (!trimmed || trimmed.length !== 3) {
      setCreateError('Currency must be a 3-letter code.');
      return;
    }
    try {
      const result = await createWallet.mutateAsync({ currency: trimmed });
      if (result?.id) {
        setActiveWalletId(result.id);
      }
    } catch (error) {
      setCreateError(error?.message ?? 'Unable to create wallet. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Wallets • Kinvest</title>
      </Head>
      <AppLayout user={user}>
        <div className="space-y-5">
          <section className="rounded-3xl border border-line/80 bg-night-2/50 p-8 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Wallets</p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="mt-2 text-3xl font-semibold text-text-primary">Unified ledger</h2>
                <p className="text-text-secondary">
                  Track personal and collective balances, plus settlement entries.
                </p>
              </div>
              <form onSubmit={handleCreateWallet} className="flex items-center gap-2">
                <input
                  value={currencyInput}
                  onChange={(event) => setCurrencyInput(event.target.value.toUpperCase())}
                  maxLength={3}
                  className="w-20 rounded-2xl border border-line bg-night-0/20 px-3 py-2 text-sm text-text-primary focus:border-accent-tech focus:outline-none"
                  aria-label="Wallet currency"
                />
                <button
                  type="submit"
                  disabled={createWallet.isPending}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    createWallet.isPending
                      ? 'cursor-not-allowed border-line text-text-muted'
                      : 'border-accent-tech text-accent-tech hover:text-accent-tech-dim'
                  }`}
                >
                  {createWallet.isPending ? 'Creating…' : 'New wallet'}
                </button>
              </form>
              {createError ? (
                <p className="text-sm text-warm-light">{createError}</p>
              ) : null}
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
            <section className="space-y-3 rounded-3xl border border-line/80 bg-night-2/50 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Wallets</p>
                  <h3 className="text-2xl font-semibold text-text-primary">Balances</h3>
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
                  {wallets.length} total
                </span>
              </div>
              {walletsQuery.isLoading ? (
                <p className="text-sm text-text-secondary">Loading wallets…</p>
              ) : wallets.length ? (
                wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => setActiveWalletId(wallet.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      wallet.id === activeWallet?.id
                        ? 'border-accent-tech/70 bg-accent-tech/10'
                        : 'border-line/60 bg-night-1/40 hover:border-accent-tech/60'
                    }`}
                  >
                    <p className="text-sm font-semibold text-text-primary">
                      {wallet.currency} wallet
                    </p>
                    <p className="text-xs text-text-muted">Status: {wallet.status}</p>
                    <div className="mt-2 text-sm text-text-secondary">
                      <p>Available: {formatCurrency(wallet.availableBalance, wallet.currency)}</p>
                      <p>Pending: {formatCurrency(wallet.pendingBalance, wallet.currency)}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-text-secondary">
                  No wallets yet. Create one to begin tracking balances.
                </p>
              )}
            </section>

            <section className="space-y-3 rounded-3xl border border-line/80 bg-night-2/50 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Transactions</p>
                  <h3 className="text-2xl font-semibold text-text-primary">
                    {activeWallet ? `${activeWallet.currency} ledger` : 'Select a wallet'}
                  </h3>
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
                  {transactionsQuery.data?.transactions?.length ?? 0} entries
                </span>
              </div>
              {transactionsQuery.isLoading ? (
                <p className="text-sm text-text-secondary">Loading transactions…</p>
              ) : transactionsQuery.data?.transactions?.length ? (
                <ul className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                  {transactionsQuery.data.transactions.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between rounded-2xl border border-line/60 bg-night-1/40 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-text-primary">
                          {entry.type ?? 'Entry'}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(entry.createdAt ?? Date.now()).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            entry.direction === 'CREDIT' ? 'text-accent-tech' : 'text-text-secondary'
                          }`}
                        >
                          {entry.direction === 'DEBIT' ? '-' : '+'}
                          {formatCurrency(entry.amount, entry.currency ?? activeWallet?.currency ?? 'USD')}
                        </p>
                        <p className="text-xs text-text-muted">{entry.status}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary">
                  No transactions yet for this wallet.
                </p>
              )}
            </section>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) {
    return {
      redirect: { destination: '/sign-in', permanent: false },
    };
  }
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const serializableUser = JSON.parse(JSON.stringify(user));
  return { props: { user: serializableUser } };
};

export default WalletsPage;
