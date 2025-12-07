import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { AppLayout } from '../../components/layouts';
import { useGroupDetails, RecordContributionModal } from '../../features/groups';
import { formatCurrency, formatDate, formatEnumLabel } from '../../utils/formatters';

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-line/70 bg-night-3/80 p-4">
      <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">{label}</p>
      <p className="mt-2 text-[22px] font-semibold tracking-[0.01em] text-text-primary">{value}</p>
      {helper ? <p className="text-sm text-text-secondary">{helper}</p> : null}
    </div>
  );
}

function PayoutTimeline({ cycles, memberLookup, currency }) {
  const [showAll, setShowAll] = useState(false);

  if (!cycles.length) {
    return (
      <p className="text-sm text-text-secondary">
        This collective has not scheduled any payout cycles yet.
      </p>
    );
  }

  const visibleCycles = showAll ? cycles : cycles.slice(0, 4);

  const statusTone = (status) => {
    if (!status) return 'bg-text-muted';
    const normalized = status.toLowerCase();
    if (normalized.includes('paid')) return 'bg-accent-tech';
    if (normalized.includes('pending') || normalized.includes('in_progress')) return 'bg-warm-1';
    if (normalized.includes('failed')) return 'bg-warm-2';
    return 'bg-text-secondary';
  };

  return (
    <>
      <div className="relative pl-5">
        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-line/70" aria-hidden="true" />
        <ol className="space-y-3">
          {visibleCycles.map((cycle, index) => {
        const receiver =
          cycle.receiver?.displayName ??
          cycle.receiver?.name ??
          memberLookup.get(cycle.receiverUserId)?.user?.displayName ??
          memberLookup.get(cycle.receiverUserId)?.user?.fullName ??
          memberLookup.get(cycle.receiverUserId)?.user?.name ??
          'Unassigned';

        return (
          <li
            key={cycle.id}
                className={`relative rounded-xl border border-line/70 pl-4 pr-4 py-3 ${
              index % 2 === 0 ? 'bg-night-3/80' : 'bg-night-3/60'
            }`}
          >
            <span
              className={`absolute -left-2.5 top-4 inline-flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-night-2/70 ${statusTone(cycle.status)}`}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">
                  Cycle {cycle.number ?? '—'}
                </p>
                <p className="text-sm font-semibold text-text-primary">{receiver}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary">
                  {formatDate(cycle.scheduledDate)}
                </p>
                <p className="text-[12px] text-text-secondary">{formatEnumLabel(cycle.status)}</p>
              </div>
            </div>
            <p className="text-[12px] text-text-secondary">
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
                        className={`flex w-full flex-col rounded-lg border px-3 py-2 ${
                          isSettled
                            ? 'border-accent-tech-dim/60 bg-night-2/70 text-accent-tech'
                            : 'border-line/60 bg-night-2/50 text-text-secondary'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between text-[12px]">
                          <span>{participantName}</span>
                          <span>{formatCurrency(expected, currency)}</span>
                        </div>
                        <span className="text-[11px] text-text-muted">
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
      </div>
      {cycles.length > 4 ? (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-line px-3 py-1 text-xs font-semibold text-text-secondary hover:border-warm-2 hover:text-warm-light"
        >
          {showAll ? 'Show fewer cycles' : `Show all ${cycles.length} cycles`}
        </button>
      ) : null}
    </>
  );
}

function MembersList({ members }) {
  if (!members.length) {
    return <p className="text-sm text-text-secondary">No members to show yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {members.map((member, index) => (
        <li
          key={member.id}
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/70 p-3 ${
            index % 2 === 0 ? 'bg-night-3/80' : 'bg-night-3/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 ${
                index === 0 ? 'border-warm-1' : index === 1 ? 'border-accent-tech-dim' : 'border-line/60'
              } bg-night-1/70`}
            >
              {member.user?.imageUrl || member.user?.profileImageUrl ? (
                <img
                  src={member.user.imageUrl ?? member.user.profileImageUrl}
                  alt={member.user?.displayName ?? member.user?.name ?? 'Member'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-text-primary">
                  {(member.user?.displayName ?? member.user?.name ?? 'M').slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {member.user?.displayName ??
                  member.user?.name ??
                  member.user?.email ??
                  'Member'}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="rounded-md border border-line/70 bg-night-2/70 px-2 py-0.5 text-[11px] text-text-secondary">
                  {formatEnumLabel(member.role)}
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-text-muted">
                  {formatEnumLabel(member.status)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-text-muted">
              {member.lastActiveAt || member.updatedAt || member.joinedAt
                ? `Last active ${formatDate(member.lastActiveAt ?? member.updatedAt ?? member.joinedAt)}`
                : 'Activity unknown'}
            </p>
            <p className="text-[11px] text-text-secondary">Turn #{index + 1}</p>
          </div>
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

  const currentCycleExpected = useMemo(() => {
    if (!currentCycle) return null;
    if (typeof currentCycle.totalExpected === 'number') return currentCycle.totalExpected;
    if (Array.isArray(currentCycle.participants)) {
      return currentCycle.participants.reduce((sum, participant) => sum + (participant.amountExpected ?? 0), 0);
    }
    return null;
  }, [currentCycle]);

  const currentCycleReceived = useMemo(() => {
    if (!currentCycle) return null;
    if (typeof currentCycle.totalReceived === 'number') return currentCycle.totalReceived;
    if (Array.isArray(currentCycle.participants)) {
      return currentCycle.participants.reduce((sum, participant) => sum + (participant.amountPaid ?? 0), 0);
    }
    return null;
  }, [currentCycle]);

  const nextCycleExpected = useMemo(() => {
    if (!nextCycle) return null;
    if (typeof nextCycle.totalExpected === 'number') return nextCycle.totalExpected;
    if (Array.isArray(nextCycle.participants)) {
      return nextCycle.participants.reduce((sum, participant) => sum + (participant.amountExpected ?? 0), 0);
    }
    return null;
  }, [nextCycle]);


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
  const headerMeta = nextCycle ? `Next: Cycle ${nextCycleNumber ?? '—'}` : null;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <AppLayout user={user} headerTitle="Group detail" headerMeta={headerMeta}>
        <section className="space-y-4 rounded-2xl border border-line/70 bg-night-2/70 px-4 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Collective</p>
              <h1 className="text-[26px] font-semibold leading-tight text-text-primary">
                {title}
              </h1>
              <p className="text-sm text-text-secondary">
                {group?.description || 'Track payouts, pay-ins, and the path of the pot.'}
              </p>
            </div>
            <span className="rounded-md border border-line/70 bg-night-3/70 px-3 py-1 text-[12px] text-text-secondary">
              {formatEnumLabel(group?.status)}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                isLoading
                  ? 'cursor-not-allowed border-line text-text-muted'
                  : 'border-line text-text-secondary hover:border-line/90 hover:text-text-primary'
              }`}
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            <Link
              href="/groups"
              className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-warm-2 hover:text-warm-light"
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
              className="rounded-md bg-warm-1 px-4 py-2 text-sm font-semibold text-night-0 transition hover:bg-warm-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-1"
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
            value={
              currentCycleExpected !== null
                ? formatCurrency(currentCycleExpected, group?.currency ?? 'USD')
                : nextCycleExpected !== null
                ? formatCurrency(nextCycleExpected, group?.currency ?? 'USD')
                : '—'
            }
            helper={
              currentCycleExpected !== null
                ? `Collected ${formatCurrency(currentCycleReceived ?? 0, group?.currency ?? 'USD')} of ${formatCurrency(currentCycleExpected, group?.currency ?? 'USD')}`
                : nextCycleExpected !== null
                ? `Next cycle target • ${payoutHelper}`
                : payoutHelper
            }
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
          <section className="space-y-4 rounded-2xl border border-line/70 bg-night-2/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Payout order</p>
                <h2 className="text-[22px] font-semibold text-text-primary">Rotation timeline</h2>
              </div>
              <span className="rounded-md border border-line px-3 py-1 text-[11px] text-text-secondary">
                {cycles.length ? `${cycles.length} tracked cycles` : 'No cycles yet'}
              </span>
            </div>
            <PayoutTimeline
              cycles={cycles}
              memberLookup={memberLookup}
              currency={group?.currency ?? 'USD'}
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-line/70 bg-night-2/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Members</p>
                <h2 className="text-[22px] font-semibold text-text-primary">Collective roster</h2>
              </div>
              <span className="rounded-md border border-line px-3 py-1 text-[11px] text-text-secondary">
                {memberCount} total
              </span>
            </div>
            <MembersList members={group?.members ?? []} />
          </section>
        </div>

        <section className="space-y-4 rounded-2xl border border-line/70 bg-night-2/70 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Payout history</p>
              <h2 className="text-[22px] font-semibold text-text-primary">Recent distributions</h2>
            </div>
            <span className="rounded-md border border-line px-3 py-1 text-[11px] text-text-secondary">
              {group?.insights?.payoutHistory?.length ?? 0} records
            </span>
          </div>
          <div className="space-y-3">
            {Array.isArray(group?.insights?.payoutHistory) && group.insights.payoutHistory.length ? (
              group.insights.payoutHistory.map((payout, index) => (
                <div
                  key={payout.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/70 px-4 py-3 text-sm ${
                    index % 2 === 0 ? 'bg-night-3/80' : 'bg-night-3/60'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-text-primary">
                      {payout.receiver?.displayName ?? payout.receiver?.email ?? 'Member'}
                    </p>
                    <p className="text-[12px] text-text-muted">
                      Cycle {payout.cycleNumber ?? '—'} • {formatDate(payout.scheduledDate ?? payout.paidAt ?? null)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">
                      {formatCurrency(payout.amount ?? 0, group?.currency ?? 'USD')}
                    </p>
                    <p className="text-[12px] text-text-muted">{formatEnumLabel(payout.status)}</p>
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
