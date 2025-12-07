import { useMemo } from 'react';
import { useAuthedApiQuery } from '../../hooks/useAuthedApiQuery';

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return null;
};

const mapMember = (member) => ({
  id: member.id,
  role: member.role ?? 'MEMBER',
  status: member.status ?? 'INVITED',
  joinedAt: member.joinedAt ?? member.createdAt ?? null,
  userId: member.userId ?? member.user?.id ?? null,
  user: member.user ?? null,
});

const mapParticipant = (participant) => ({
  id: participant.id,
  userId: participant.userId,
  status: participant.status ?? 'PENDING',
  amountExpected: toNumber(participant.amountExpected),
  amountPaid: toNumber(participant.amountPaid),
  paidAt: participant.paidAt ?? null,
  user: participant.user ?? null,
});

const mapCycle = (cycle) => ({
  id: cycle.id,
  number: cycle.cycleNumber ?? cycle.number ?? null,
  scheduledDate: cycle.scheduledDate ?? cycle.date ?? null,
  status: cycle.status ?? 'PENDING',
  receiverUserId: cycle.receiverUserId ?? cycle.receiver?.id ?? null,
  receiver: cycle.receiver ?? null,
  totalExpected: toNumber(cycle.totalExpected),
  totalReceived: toNumber(cycle.totalReceived),
  participants: Array.isArray(cycle.participants)
    ? cycle.participants.map(mapParticipant)
    : [],
  contributionStatus: cycle.contributionStatus ?? null,
  payouts: Array.isArray(cycle.payouts) ? cycle.payouts : [],
});

const normalizeGroupDetails = (group) => {
  if (!group) return null;

  return {
    id: group.id,
    name: group.name ?? 'Untitled group',
    description: group.description ?? '',
    status: group.status ?? 'ACTIVE',
    contributionAmount: toNumber(group.contributionAmount ?? group.template?.contributionAmount),
    currency: group.currency ?? group.template?.currency ?? 'USD',
    frequency: group.frequency ?? group.template?.frequency ?? 'MONTHLY',
    rotationStrategy: group.rotationStrategy ?? group.template?.rotationStrategy ?? 'FIXED_ORDER',
    slotCount: group.slotCount ?? group.template?.slotCount ?? 0,
    autoPayoutEnabled: group.autoPayoutEnabled ?? true,
    lateFeePercent: toNumber(group.lateFeePercent),
    gracePeriodDays: group.gracePeriodDays ?? null,
    template: group.template ?? null,
    members: Array.isArray(group.members) ? group.members.map(mapMember) : [],
    cycles: Array.isArray(group.cycles) ? group.cycles.map(mapCycle) : [],
    insights: group.insights ?? null,
  };
};

export const groupDetailsQueryKey = (groupId) => [
  'groups',
  groupId ?? 'unknown',
  'detail',
];

export function useGroupDetails(groupId, options = {}) {
  const path = groupId
    ? `/api/groups/${encodeURIComponent(groupId)}`
    : '/api/groups/unknown';
  const enabled = Boolean(groupId) && (options.enabled ?? true);

  const query = useAuthedApiQuery(groupDetailsQueryKey(groupId), path, {
    enabled,
    select: (data) => normalizeGroupDetails(data),
    ...options,
  });

  return useMemo(() => ({
    ...query,
    data: query.data ?? null,
  }), [query]);
}
