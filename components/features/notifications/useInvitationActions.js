import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '../../../lib/apiClient';
import {
  INVITATIONS_QUERY_KEY,
  USER_INVITATIONS_PATH,
} from './useInvitations';
import { groupDetailsQueryKey } from '../groups/useGroupDetails';
import { DASHBOARD_OVERVIEW_QUERY_KEY } from '../dashboard/queries';

const TEMPLATE =
  process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

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

const mapMember = (member) => ({
  id: member.id,
  role: member.role ?? 'MEMBER',
  status: member.status ?? 'INVITED',
  joinedAt: member.joinedAt ?? member.createdAt ?? null,
  userId: member.userId ?? member.user?.id ?? null,
  user: member.user ?? null,
});

function useInvitationActionMutation(actionType, getToken, queryClient) {
  return useMutation({
    mutationKey: [...INVITATIONS_QUERY_KEY, actionType],
    mutationFn: async (invitationId) => {
      if (!invitationId) {
        throw new Error('Missing invitation id for invitation action');
      }

      const token = await getToken(
        TEMPLATE ? { template: TEMPLATE } : undefined,
      );
      if (!token) {
        throw new Error('Unable to fetch auth token for invitation action');
      }
      const encodedId = encodeURIComponent(invitationId);
      const actionPayload =
        actionType === 'accept'
          ? 'ACCEPT'
          : 'DECLINE';

      return fetchFromApi(
        `${USER_INVITATIONS_PATH}/${encodedId}/respond`,
        {
          token,
          method: 'POST',
          body: { action: actionPayload },
        },
      );
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: INVITATIONS_QUERY_KEY,
        exact: false,
      });

      const membership = response?.membership ?? null;
      const invitation = response?.invitation ?? null;
      const groupId = membership?.groupId ?? invitation?.groupId ?? null;

      if (groupId) {
        queryClient.invalidateQueries({
          queryKey: ['groups'],
          exact: false,
        });

        queryClient.invalidateQueries({
          queryKey: groupDetailsQueryKey(groupId),
          exact: false,
        });

        // Merge new cycles and membership into any cached group detail to keep UI in sync while refetching.
        queryClient.setQueryData(groupDetailsQueryKey(groupId), (existing) => {
          if (!existing) return existing;

          const nextMembers = Array.isArray(existing.members) ? [...existing.members] : [];
          if (membership?.userId) {
            const mappedMember = mapMember(membership);
            const memberIndex = nextMembers.findIndex(
              (memberItem) => memberItem.userId === mappedMember.userId,
            );
            if (memberIndex >= 0) {
              nextMembers[memberIndex] = { ...nextMembers[memberIndex], ...mappedMember };
            } else {
              nextMembers.push(mappedMember);
            }
          }

          const generatedCycles = Array.isArray(response?.generatedCycles)
            ? response.generatedCycles.map(mapCycle)
            : [];

          if (!generatedCycles.length) {
            if (!membership) return existing;
            return { ...existing, members: nextMembers };
          }

          const existingCycles = Array.isArray(existing.cycles) ? [...existing.cycles] : [];
          const existingIds = new Set(existingCycles.map((cycle) => cycle.id));
          generatedCycles.forEach((cycle) => {
            if (!cycle?.id || existingIds.has(cycle.id)) return;
            existingIds.add(cycle.id);
            existingCycles.push(cycle);
          });

          existingCycles.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

          return {
            ...existing,
            members: nextMembers,
            cycles: existingCycles,
          };
        });
      }

      queryClient.invalidateQueries({
        queryKey: DASHBOARD_OVERVIEW_QUERY_KEY,
        exact: false,
      });
    },
  });
}

export function useInvitationActions() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const acceptInvitation = useInvitationActionMutation(
    'accept',
    getToken,
    queryClient,
  );
  const declineInvitation = useInvitationActionMutation(
    'decline',
    getToken,
    queryClient,
  );

  return { acceptInvitation, declineInvitation };
}
