import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { AppLayout } from '../components/layouts';
import { useCreateGroupModal, RecordContributionModal } from '../features/groups';
import { PlusIcon } from '../components/icons';
import {
  useDashboardOverviewQuery,
  normalizeOverview,
  fetchDashboardOverview,
  DEFAULT_DASHBOARD_OVERVIEW,
  DASHBOARD_OVERVIEW_QUERY_KEY,
} from '../features/dashboard';

const TEMPLATE =
  process.env.CLERK_JWT_TEMPLATE ?? process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

const extractMemberships = (profilePayload) => {
  if (!profilePayload) return [];
  if (Array.isArray(profilePayload.memberships)) return profilePayload.memberships;
  if (Array.isArray(profilePayload.groups)) return profilePayload.groups;
  return [];
};

import { formatCurrency, formatCycleDate } from '../utils/formatters';

const deriveMemberCount = (group) => {
  if (typeof group?.memberCount === 'number') return group.memberCount;
  if (typeof group?.members === 'number') return group.members;
  if (Array.isArray(group?.members)) return group.members.length;
  if (typeof group?.members?.count === 'number') return group.members.count;
  return '—';
};

const deriveGroupStatus = (group) => group?.status ?? group?.state ?? 'ACTIVE';

const deriveNextCycle = (group) => {
  const nextCycle =
    group?.nextCycle ?? group?.nextCycleDate ?? group?.nextCycleAt ?? group?.cycles?.[0] ?? null;

  if (!nextCycle) return 'TBD';
  if (typeof nextCycle === 'string') return nextCycle;
  if (nextCycle instanceof Date) {
    return formatCycleDate(nextCycle) ?? 'Scheduled';
  }
  if (typeof nextCycle === 'number') return `Cycle ${nextCycle}`;
  if (typeof nextCycle === 'object') {
    const cycleLabelParts = [];
    if (nextCycle.cycleNumber !== undefined) {
      cycleLabelParts.push(`Cycle ${nextCycle.cycleNumber}`);
    }
    const formattedDate = formatCycleDate(nextCycle.scheduledDate ?? nextCycle.date ?? nextCycle.startsAt);
    if (formattedDate) {
      cycleLabelParts.push(formattedDate);
    } else if (nextCycle.status) {
      cycleLabelParts.push(nextCycle.status);
    }
    return cycleLabelParts.length ? cycleLabelParts.join(' • ') : 'Scheduled';
  }

  return String(nextCycle);
};

const toAmount = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

async function resolveServerToken(authData) {
  if (!authData?.getToken) return null;
  try {
    return await authData.getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
  } catch (error) {
    if (TEMPLATE) {
      try {
        return await authData.getToken();
      } catch (innerError) {
      }
    }
    return null;
  }
}

const CONTRIBUTION_MODAL_INITIAL = {
  isOpen: false,
  groupId: null,
  cycleOptions: [],
  amount: '',
};

function Dashboard({ user, overview }) {
  const [contributionModal, setContributionModal] = useState(CONTRIBUTION_MODAL_INITIAL);
  const overviewQuery = useDashboardOverviewQuery({
    placeholderData: overview ?? null,
  });
  const { open: openCreateGroup } = useCreateGroupModal();

  const normalized = normalizeOverview(overviewQuery.data ?? overview ?? null);
  const profileData = normalized.profile;
  const metricsData = normalized.metrics;
  const groupsData = normalized.groups;
  const walletsData = normalized.wallets;
  const ledgerEntries = normalized.ledgerEntries;

  const isLoading = overviewQuery.isFetching;
  const hasError = overviewQuery.isError;

  const preferredCurrency =
    profileData?.profile?.currency ||
    profileData?.currency ||
    walletsData?.[0]?.currency ||
    'USD';

  const membershipGroups = groupsData.length
    ? groupsData
    : extractMemberships(profileData || {}).map((membership) => ({
        name: membership?.groupName ?? membership?.name ?? 'Untitled group',
        status: deriveGroupStatus(membership),
        contribution: membership?.contributionAmount
          ? formatCurrency(membership.contributionAmount, membership?.currency ?? preferredCurrency)
          : '—',
        members: deriveMemberCount(membership),
        nextCycle: deriveNextCycle(membership),
      }));

  const ledger = Array.isArray(ledgerEntries) ? ledgerEntries : [];

  const walletTotals = walletsData.reduce(
    (acc, wallet) => {
      acc.available += toAmount(wallet.availableBalance);
      acc.pending += toAmount(wallet.pendingBalance);
      return acc;
    },
    { available: 0, pending: 0 },
  );

  const walletSummary = {
    available: walletTotals.available || toAmount(metricsData?.walletBalance),
    pending: walletTotals.pending,
    note:
      walletsData.length > 1
        ? `${walletsData.length} wallets`
        : metricsData?.walletNote ?? (walletsData.length === 1 ? 'Single wallet' : 'Wallets unavailable'),
  };

  const rotationRows = membershipGroups.map((group) => {
    const contributionDisplay =
      group.contribution ?? formatCurrency(group.contributionAmount, group.currency ?? preferredCurrency);
    const contributionValue = group.contributionAmount ?? toAmount(group.contribution);
    let nextCycleLabel = 'TBD';
    let nextCycleId = null;
    let cycleOption = null;
    if (typeof group.nextCycle === 'string' || typeof group.nextCycle === 'number') {
      nextCycleLabel = String(group.nextCycle);
    } else if (group.nextCycle) {
      nextCycleLabel = deriveNextCycle({ nextCycle: group.nextCycle });
      nextCycleId = group.nextCycle.id ?? group.nextCycle.cycleId ?? null;
      cycleOption = {
        id: nextCycleId ?? `${group.id}-${group.nextCycle.cycleNumber ?? 'next'}`,
        number: group.nextCycle.cycleNumber ?? group.nextCycle.number ?? '—',
        date: formatCycleDate(group.nextCycle.scheduledDate ?? group.nextCycle.date ?? group.nextCycle.startsAt),
      };
    } else {
      nextCycleLabel = deriveNextCycle(group);
    }

    return {
      id: group.id,
      name: group.name,
      contribution: contributionDisplay,
      nextCycleLabel,
      nextCycleId,
      cycleOptions: cycleOption
        ? [{ ...cycleOption, hasContributed: false }]
        : [{ id: `${group.id}-next`, number: '?', date: 'Next cycle', hasContributed: false }],
      contributionValue,
    };
  });

  return (
    <>
      <Head>
        <title>Workspace • Kinvest</title>
      </Head>
      <AppLayout user={user}>
        {hasError ? (
          <div className="rounded-2xl border border-warm-soft/40 bg-warm-soft/10 p-4 text-sm text-warm-light">
            Some panels failed to load live data. Try refreshing or check the API logs.
          </div>
        ) : null}
        {isLoading ? (
          <div className="rounded-2xl border border-accent-tech-soft/30 bg-accent-tech-soft/20 p-4 text-sm text-accent-tech">
            Syncing fresh data…
          </div>
        ) : null}

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line/70 bg-night-2/40 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Workspace</p>
            <h2 className="text-2xl font-semibold text-text-primary">Rotation snapshot</h2>
            <p className="text-sm text-text-secondary">Metrics update every minute while you manage groups.</p>
          </div>
          <button
            type="button"
            onClick={() => openCreateGroup()}
            className="inline-flex items-center gap-2 rounded-full bg-accent-tech px-4 py-2 text-sm font-semibold text-night-0 shadow-techGlow transition hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            New group
          </button>
        </section>

        <section className="rounded-3xl border border-line/80 bg-night-2/50 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">My rotation</p>
              <h3 className="text-xl font-semibold text-text-primary">Upcoming contributions</h3>
            </div>
            <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
              {rotationRows.length} active
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {rotationRows.length ? (
              rotationRows.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/60 bg-night-1/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{row.name ?? 'Untitled group'}</p>
                    <p className="text-xs text-text-muted">
                      {row.contribution} • Next cycle: {row.nextCycleLabel}
                    </p>
                  </div>
                  <Link
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setContributionModal({
                        isOpen: true,
                        groupId: row.id,
                        cycleOptions: row.cycleOptions,
                        amount: row.contributionValue,
                      });
                    }}
                    className="rounded-full border border-accent-tech px-3 py-1 text-xs font-semibold text-accent-tech transition hover:text-accent-tech-dim"
                  >
                    Record contribution
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary">
                No rotations yet. Create a group to get started.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="rounded-3xl border border-line/80 bg-night-2/50 p-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Your groups</p>
                <h3 className="text-2xl font-semibold text-text-primary">Collectives</h3>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
                {membershipGroups.length} total
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {membershipGroups.length ? (
                membershipGroups.map((group) => (
                  <div
                    key={group.name}
                    className="rounded-2xl border border-line/50 bg-night-1/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary">{group.name}</p>
                      <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-text-secondary">
                        {deriveGroupStatus(group)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {group.contribution ?? formatCurrency(group.contributionAmount, group.currency ?? preferredCurrency)} per member
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                      <span>{deriveMemberCount(group)} members</span>
                      <span className="text-text-warm">Next cycle: {deriveNextCycle(group)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary">
                  No collectives yet. Start one to see it here.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-line/80 bg-night-2/50 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Wallets</p>
                <h3 className="text-2xl font-semibold text-text-primary">Ledger</h3>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
                {walletSummary.note}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Available</p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {formatCurrency(walletSummary.available, preferredCurrency)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Pending</p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {formatCurrency(walletSummary.pending, preferredCurrency)}
                </p>
              </div>
            </div>
            {ledger.length ? (
              <ul className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-1">
                {ledger.map((entry, index) => (
                  <li
                    key={`${entry.id ?? entry.label ?? entry.description}-${entry.date ?? entry.createdAt ?? index}`}
                    className="flex items-center justify-between rounded-2xl border border-line/60 bg-night-1/50 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-text-primary">{entry.label ?? entry.description ?? 'Entry'}</p>
                      <p className="text-xs text-text-muted">{entry.date ?? entry.createdAt ?? ''}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          (entry.amount ?? '').toString().trim().startsWith('+') || entry.direction === 'CREDIT'
                            ? 'text-accent-tech'
                            : 'text-text-secondary'
                        }`}
                      >
                        {typeof entry.amount === 'number'
                          ? formatCurrency(entry.amount, entry.currency ?? preferredCurrency)
                          : entry.amount ?? '—'}
                      </p>
                      <p className="text-xs text-text-muted">{entry.status ?? entry.type ?? 'Status unknown'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-text-secondary">
                No ledger entries yet. Activity will appear here once transactions post.
              </p>
            )}
          </article>
        </section>
        <RecordContributionModal
          isOpen={contributionModal.isOpen}
          groupId={contributionModal.groupId}
          cycleOptions={contributionModal.cycleOptions}
          defaultAmount={contributionModal.amount}
          onClose={() => setContributionModal(CONTRIBUTION_MODAL_INITIAL)}
        />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const { req } = ctx;
  const { userId } = getAuth(req);

  if (!userId) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    };
  }

  const authData = getAuth(req);
  const token = await resolveServerToken(authData);

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const queryClient = new QueryClient();

  const overviewRaw = await fetchDashboardOverview(queryClient, token, {
    fallback: DEFAULT_DASHBOARD_OVERVIEW,
  });

  const overview = normalizeOverview(overviewRaw);
  queryClient.setQueryData(DASHBOARD_OVERVIEW_QUERY_KEY, overview);

  const serializableUser = JSON.parse(JSON.stringify(user));
  const serializableOverview = JSON.parse(JSON.stringify(overview));
  const dehydratedState = JSON.parse(JSON.stringify(dehydrate(queryClient)));

  return {
    props: {
      user: serializableUser,
      overview: serializableOverview,
      dehydratedState,
    },
  };
};

export default Dashboard;
