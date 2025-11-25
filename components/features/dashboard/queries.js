import { useAuthedApiQuery } from '../../../hooks/useAuthedApiQuery';
import { fetchFromApi } from '../../../lib/apiClient';

export const DASHBOARD_OVERVIEW_QUERY_KEY = ['dashboard', 'overview'];
export const DASHBOARD_OVERVIEW_PATH = '/api/dashboard/overview';

const toSafeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return Number(value) || 0;
};

const normalizeMetrics = (metricsPayload) => {
  if (!metricsPayload) return null;

  return {
    totalContributions:
      metricsPayload.totalContributions ??
      metricsPayload.totalContribution ??
      metricsPayload.totalContributed ??
      0,
    totalReceived:
      metricsPayload.totalReceived ?? metricsPayload.totalPayouts ?? metricsPayload.totalPayout ?? 0,
    walletBalance: metricsPayload.walletBalance ?? metricsPayload.totalWallet ?? metricsPayload.primaryWalletBalance ?? 0,
    payoutPosition: metricsPayload.payoutPosition ?? metricsPayload.rotationPosition,
    slotCount: metricsPayload.slotCount ?? metricsPayload.rotationSize,
    contributionDelta: metricsPayload.contributionDelta ?? metricsPayload.delta,
    nextPayoutEta: metricsPayload.nextPayoutEta ?? metricsPayload.nextPayout,
    walletNote: metricsPayload.walletNote ?? metricsPayload.walletMessage,
    pendingContributions: metricsPayload.pendingContributions ?? 0,
    pendingPayouts: metricsPayload.pendingPayouts ?? 0,
    activeGroups: metricsPayload.activeGroups ?? metricsPayload.groupCount ?? 0,
  };
};

const normalizeGroups = (groupsPayload) => {
  const list = toSafeArray(groupsPayload);
  return list.map((group) => ({
    id: group.id,
    name: group.name ?? group.groupName ?? 'Untitled group',
    status: group.status ?? group.state ?? 'ACTIVE',
    currency: group.currency,
    contributionAmount: toNumber(group.contributionAmount ?? group.contribution),
    role: group.role ?? group.members?.[0]?.role ?? 'MEMBER',
    membershipStatus: group.membershipStatus ?? group.members?.[0]?.status ?? 'INVITED',
    members: group.members ?? group.memberCount ?? group.membershipCount,
    nextCycle: group.nextCycle ?? group.cycles?.[0] ?? null,
  }));
};

const normalizeWallets = (walletPayload) => {
  if (Array.isArray(walletPayload)) {
    return walletPayload.map((wallet) => ({
      id: wallet.id,
      currency: wallet.currency,
      availableBalance: toNumber(wallet.availableBalance),
      pendingBalance: toNumber(wallet.pendingBalance),
    }));
  }

  if (walletPayload && typeof walletPayload === 'object') {
    const wallets = walletPayload.wallets ?? [];
    const summaryWallets = Array.isArray(wallets)
      ? wallets
      : walletPayload.primaryWallet
      ? [walletPayload.primaryWallet]
      : [];

    return summaryWallets.map((wallet) => ({
      id: wallet.id ?? 'primary',
      currency: wallet.currency,
      availableBalance: toNumber(wallet.availableBalance ?? wallet.totalAvailableBalance),
      pendingBalance: toNumber(wallet.pendingBalance ?? wallet.totalPendingBalance),
    }));
  }

  return [];
};

const normalizeLedger = (ledgerPayload) => {
  const ledgerArray = toSafeArray(ledgerPayload);
  return ledgerArray.map((entry) => ({
    id: entry.id,
    type: entry.type ?? entry.direction ?? 'ENTRY',
    amount: toNumber(entry.amount),
    status: entry.status,
    createdAt: entry.createdAt ?? entry.date,
    label: entry.label,
    description: entry.description,
    group: entry.group,
    cycleNumber: entry.cycleNumber,
    currency: entry.currency,
  }));
};

export const normalizeOverview = (data) => {
  const base = data ?? {};
  const profile = base.profile ?? null;
  const metrics = normalizeMetrics(base.metrics);
  const groups = normalizeGroups(base.groupSnapshots ?? base.groups ?? []);
  const wallets = normalizeWallets(base.walletSummary ?? base.wallets ?? []);
  const ledgerEntries = normalizeLedger(base.ledger ?? base.ledgerEntries ?? []);
  const alerts = Array.isArray(base.alerts) ? base.alerts : [];

  return {
    syncedAt: base.syncedAt ?? null,
    profile,
    metrics,
    groups,
    wallets,
    ledgerEntries,
    alerts,
  };
};

export const DEFAULT_DASHBOARD_OVERVIEW = {
  profile: null,
  metrics: null,
  groups: [],
  wallets: [],
  ledgerEntries: [],
  alerts: [],
};

export function useDashboardOverviewQuery(options = {}) {
  return useAuthedApiQuery(
    DASHBOARD_OVERVIEW_QUERY_KEY,
    DASHBOARD_OVERVIEW_PATH,
    options,
  );
}

export async function fetchDashboardOverview(queryClient, token, { fallback = DEFAULT_DASHBOARD_OVERVIEW } = {}) {
  if (!token) {
    return fallback;
  }

  try {
    const data = await queryClient.fetchQuery({
      queryKey: DASHBOARD_OVERVIEW_QUERY_KEY,
      queryFn: () => fetchFromApi(DASHBOARD_OVERVIEW_PATH, { token }),
    });
    return data;
  } catch (error) {
    return fallback;
  }
}
