import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import AppLayout from '../../components/AppLayout';
import { useGroupDetails } from '../../components/features/groups/useGroupDetails';
import RecordContributionModal from '../../components/features/groups/RecordContributionModal';

const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    return `${value} ${currency ?? ''}`.trim();
  }
};

const formatDate = (value, { includeTime = false } = {}) => {
  if (!value) return 'TBD';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: 'numeric',
          minute: 'numeric',
        }
      : {}),
  }).format(date);
};

const formatEnumLabel = (value) => {
  if (!value) return '—';
  return value
    .toString()
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-night-1/50 p-4">
      <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
      {helper ? <p className="text-sm text-text-secondary">{helper}</p> : null}
    </div>
  );
}

function PayoutTimeline({ cycles, memberLookup, currency }) {
  if (!cycles.length) {
    return (
      <p className="text-sm text-text-secondary">
        This collective has not scheduled any payout cycles yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {cycles.map((cycle) => {
        const receiver =
          cycle.receiver?.displayName ??
          cycle.receiver?.name ??
          memberLookup.get(cycle.receiverUserId)?.user?.displayName ??
          memberLookup.get(cycle.receiverUserId)?.user?.fullName ??
          memberLookup.get(cycle.receiverUserId)?.user?.name ??
          'Unassigned';

        return (
          <li key={cycle.id} className="rounded-2xl border border-line/60 bg-night-0/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-text-muted">
                  Cycle {cycle.number ?? '—'}
                </p>
                <p className="text-base font-semibold text-text-primary">{receiver}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary">
                  {formatDate(cycle.scheduledDate)}
                </p>
                <p className="text-xs text-text-secondary">{formatEnumLabel(cycle.status)}</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary">
              Collected {formatCurrency(cycle.totalReceived ?? 0, currency)} of{' '}
              {formatCurrency(cycle.totalExpected ?? 0, currency)}
            </p>
            {cycle.participants?.length ? (
              <div className="mt-3 grid gap-2 text-xs text-text-secondary sm:grid-cols-2">
                {cycle.participants.map((participant) => {
                  const participantName =
                    participant.user?.displayName ??
                    participant.user?.name ??
                    memberLookup.get(participant.userId)?.user?.displayName ??
                    memberLookup.get(participant.userId)?.user?.name ??
                    'Member';
                  const paid = participant.amountPaid ?? 0;
                  const expected = participant.amountExpected ?? 0;
                  const isSettled = paid >= expected && expected > 0;
                    return (
                      <div
                        key={participant.id}
                        className={`flex w-full flex-col rounded-xl border px-3 py-1 ${
                          isSettled
                            ? 'border-accent-tech/50 bg-accent-tech/10 text-accent-tech'
                            : 'border-line/40 bg-night-1/30 text-text-secondary'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between text-xs">
                          <span>{participantName}</span>
                          <span>{formatCurrency(expected, currency)}</span>
                        </div>
                        <span className="text-[10px] text-text-muted">
                          {isSettled
                            ? `Paid ${formatCurrency(paid, currency)} of ${formatCurrency(expected, currency)}`
                            : `Paid ${formatCurrency(paid, currency)} of ${formatCurrency(expected, currency)}`}
                        </span>
                      </div>
                    );
                })}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function MembersList({ members }) {
  if (!members.length) {
    return <p className="text-sm text-text-secondary">No members to show yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line/70 bg-night-0/30 p-3"
        >
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {member.user?.displayName ??
                member.user?.name ??
                member.user?.email ??
                'Member'}
            </p>
            <p className="text-xs text-text-secondary">
              {formatEnumLabel(member.role)} • {formatEnumLabel(member.status)}
            </p>
          </div>
          <p className="text-xs text-text-muted">
            {member.joinedAt ? `Joined ${formatDate(member.joinedAt)}` : '—'}
          </p>
        </li>
      ))}
    </ul>
  );
}

const INITIAL_CONTRIBUTION_MODAL = { isOpen: false, groupId: null, cycleOptions: [], amount: '' };

function GroupDetailPage({ user, groupId }) {
  const [contributionModal, setContributionModal] = useState(INITIAL_CONTRIBUTION_MODAL);
  const {
    data: group,
    isLoading,
    isError,
    refetch,
  } = useGroupDetails(groupId, {
    enabled: Boolean(groupId),
  });

  const memberLookup = useMemo(() => {
    const map = new Map();
    if (group?.members) {
      group.members.forEach((member) => {
        if (member.userId) {
          map.set(member.userId, member);
        }
      });
    }
    return map;
  }, [group]);

  const cycles = useMemo(() => {
    if (!Array.isArray(group?.cycles)) return [];
    return [...group.cycles]
      .filter((cycle) => cycle.number !== null)
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
  }, [group]);

  const cycleOptions = useMemo(() => {
    const currentUserId = user?.id ?? null;
    return cycles.map((cycle) => {
      const participant = cycle.participants?.find((p) => p.userId === currentUserId);
      const amountPaid = participant?.amountPaid ?? 0;
      const amountExpected = participant?.amountExpected ?? 0;
      return {
        id: cycle.id,
        number: cycle.number,
        date: formatDate(cycle.scheduledDate),
        hasContributed:
          amountExpected > 0 &&
          (amountPaid >= amountExpected || participant?.status === 'PAID'),
      };
    });
  }, [cycles, user?.id]);

  const collectionSummary = useMemo(() => {
    if (!cycles.length) {
      return { totalExpected: 0, totalReceived: 0, outstanding: 0 };
    }
    const totalExpected = cycles.reduce(
      (sum, cycle) => sum + (cycle.totalExpected ?? 0),
      0,
    );
    const totalReceived = cycles.reduce(
      (sum, cycle) => sum + (cycle.totalReceived ?? 0),
      0,
    );
    return {
      totalExpected,
      totalReceived,
      outstanding: Math.max(totalExpected - totalReceived, 0),
    };
  }, [cycles]);

  const title = group?.name ?? 'Group';
  const pageTitle = `${group ? `${group.name} • Group detail` : 'Group detail'} • Kinvest`;
  const contributionLabel = group
    ? formatCurrency(group.contributionAmount, group.currency)
    : '—';
  const frequencyLabel = formatEnumLabel(group?.frequency);
  const rotationLabel = formatEnumLabel(group?.rotationStrategy);
  const memberCount = group?.members?.length ?? 0;
  const autoPayoutEnabled = group?.autoPayoutEnabled ?? true;
  const payoutHelper = autoPayoutEnabled
    ? `Freq: ${frequencyLabel} • Auto payout on`
    : `Freq: ${frequencyLabel} • Auto payout off`;
  const monthlyPayout = useMemo(() => {
    if (Array.isArray(group?.insights?.payoutsByMonth) && group.insights.payoutsByMonth.length) {
      return group.insights.payoutsByMonth[0].total;
    }
    if (cycles.length && cycles[0]?.totalExpected) {
      return cycles[0].totalExpected;
    }
    const base = group?.contributionAmount ?? 0;
    const participantCount = cycles[0]?.participants?.length ?? memberCount ?? group?.slotCount ?? 0;
    return base * participantCount;
  }, [group?.insights?.payoutsByMonth, cycles, group?.contributionAmount, memberCount, group?.slotCount]);

  const currentCycle = useMemo(() => {
    if (group?.insights?.currentCycle) {
      return group.insights.currentCycle;
    }
    if (!cycles.length) return null;
    return cycles.find((cycle) => cycle.status !== 'PAID_OUT') ?? cycles[cycles.length - 1];
  }, [group, cycles]);

  const nextCycle = useMemo(() => {
    if (group?.insights?.nextCycle) {
      return group.insights.nextCycle;
    }
    if (!cycles.length) return null;
    if (currentCycle) {
      const currentIndex = cycles.findIndex((cycle) => cycle.id === currentCycle.id);
      const upcoming = cycles
        .slice(currentIndex >= 0 ? currentIndex + 1 : 0)
        .find((cycle) => cycle.status !== 'PAID_OUT');
      if (upcoming) return upcoming;
    }
    const firstPending = cycles.find((cycle) => cycle.status !== 'PAID_OUT');
    return firstPending ?? cycles[cycles.length - 1];
  }, [group, cycles, currentCycle]);


  const nextCycleReceiver = useMemo(() => {
    if (!nextCycle) return 'TBD';
    const receiverMember = memberLookup.get(nextCycle.receiverUserId);
    return (
      nextCycle.receiver?.displayName ||
      nextCycle.receiver?.name ||
      receiverMember?.user?.displayName ||
      receiverMember?.user?.name ||
      'Unassigned'
    );
  }, [nextCycle, memberLookup]);

  const currentCycleFullyPaid = useMemo(() => {
    if (!currentCycle?.participants?.length) return false;
    return currentCycle.participants.every((participant) => {
      const paid = participant.amountPaid ?? 0;
      const expected = participant.amountExpected ?? 0;
      return expected > 0 && paid >= expected;
    });
  }, [currentCycle]);

  const currentCycleNumber = currentCycle?.number ?? currentCycle?.cycleNumber ?? null;
  const nextCycleNumber = nextCycle?.number ?? nextCycle?.cycleNumber ?? null;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <AppLayout user={user}>
        <section className="space-y-4 rounded-3xl border border-line/80 bg-night-2/40 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Collective</p>
              <h1 className="text-3xl font-semibold text-text-primary">
                {title}
              </h1>
              <p className="text-sm text-text-secondary">
                {group?.description || 'Track payouts, pay-ins, and the path of the pot.'}
              </p>
            </div>
            <span className="rounded-full border border-accent-tech px-4 py-1 text-sm font-semibold text-accent-tech">
              {formatEnumLabel(group?.status)}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className={`rounded-full border px-4 py-1 text-sm transition ${
                isLoading
                  ? 'cursor-not-allowed border-line text-text-muted'
                  : 'border-line text-text-secondary hover:border-accent-tech hover:text-accent-tech'
              }`}
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            <Link
              href="/groups"
              className="rounded-full border border-line px-4 py-1 text-sm text-text-secondary transition hover:border-accent-tech hover:text-accent-tech"
            >
              Back to groups
            </Link>
            <button
              type="button"
              onClick={() =>
                setContributionModal({
                  isOpen: true,
                  groupId,
                  cycleOptions,
                  amount: group?.contributionAmount ?? '',
                })
              }
              className="rounded-full border border-accent-tech px-4 py-1 text-sm text-accent-tech transition hover:text-accent-tech-dim"
            >
              Record contribution
            </button>
          </div>
          {isError ? (
            <p className="text-sm text-warm-light">Unable to load this group right now.</p>
          ) : null}
          {!isLoading && !group ? (
            <p className="text-sm text-text-secondary">
              We couldn&apos;t find that group. It may have been archived or you may no longer have access.
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="payout"
            value={formatCurrency(monthlyPayout, group?.currency ?? 'USD')}
            helper={payoutHelper}
          />
          <StatCard
            label="Members"
            value={memberCount || '0'}
            helper={rotationLabel}
          />
          <StatCard
            label="Next cycle"
            value={nextCycle ? `Cycle ${nextCycleNumber ?? '—'}` : 'Pending'}
            helper={`${nextCycleReceiver} • ${formatDate(nextCycle?.scheduledDate)}`}
          />
          <StatCard
            label="Contributions"
            value={
              currentCycle
                ? currentCycleFullyPaid
                  ? 'All paid'
                  : 'Pending'
                : 'No active cycle'
            }
            helper={
              currentCycle
                ? `${
                    currentCycleNumber ? `Cycle ${currentCycleNumber}` : 'Current cycle'
                  } • ${currentCycleFullyPaid ? 'Everyone contributed' : 'Awaiting payments'}`
                : 'Waiting for the current cycle to start'
            }
          />
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="space-y-4 rounded-3xl border border-line/80 bg-night-2/40 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Payout order</p>
                <h2 className="text-2xl font-semibold text-text-primary">Rotation timeline</h2>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
                {cycles.length ? `${cycles.length} tracked cycles` : 'No cycles yet'}
              </span>
            </div>
            <PayoutTimeline
              cycles={cycles}
              memberLookup={memberLookup}
              currency={group?.currency ?? 'USD'}
            />
          </section>

          <section className="space-y-4 rounded-3xl border border-line/80 bg-night-2/40 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Members</p>
                <h2 className="text-2xl font-semibold text-text-primary">Collective roster</h2>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
                {memberCount} total
              </span>
            </div>
            <MembersList members={group?.members ?? []} />
          </section>
        </div>

        <section className="space-y-4 rounded-3xl border border-line/80 bg-night-2/40 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Payout history</p>
              <h2 className="text-2xl font-semibold text-text-primary">Recent distributions</h2>
            </div>
            <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
              {group?.insights?.payoutHistory?.length ?? 0} records
            </span>
          </div>
          <div className="space-y-3">
            {Array.isArray(group?.insights?.payoutHistory) && group.insights.payoutHistory.length ? (
              group.insights.payoutHistory.map((payout) => (
                <div
                  key={payout.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-night-1/40 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-text-primary">
                      {payout.receiver?.displayName ?? payout.receiver?.email ?? 'Member'}
                    </p>
                    <p className="text-xs text-text-muted">
                      Cycle {payout.cycleNumber ?? '—'} • {formatDate(payout.scheduledDate ?? payout.paidAt ?? null)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">
                      {formatCurrency(payout.amount ?? 0, group?.currency ?? 'USD')}
                    </p>
                    <p className="text-xs text-text-muted">{formatEnumLabel(payout.status)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary">No payouts recorded yet.</p>
            )}
          </div>
        </section>

        <RecordContributionModal
          isOpen={contributionModal.isOpen}
          onClose={() => setContributionModal(INITIAL_CONTRIBUTION_MODAL)}
          groupId={contributionModal.groupId}
          cycleOptions={contributionModal.cycleOptions}
          defaultAmount={contributionModal.amount}
        />
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

  return {
    props: {
      user: serializableUser,
      groupId: ctx.params?.groupId ?? null,
    },
  };
};

export default GroupDetailPage;
