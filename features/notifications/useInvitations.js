import { useAuthedApiQuery } from '../../hooks/useAuthedApiQuery';

export const INVITATIONS_QUERY_KEY = ['notifications', 'invitations'];
export const USER_INVITATIONS_PATH = '/api/users/me/invitations';

const CANONICAL_INVITATION_STATUSES = new Set([
  'INVITED',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
]);

const normalizeInvitationStatus = (status) => {
  if (!status) return 'INVITED';
  const normalizedStatus = String(status).toUpperCase();
  if (normalizedStatus === 'PENDING') {
    return 'INVITED';
  }
  return CANONICAL_INVITATION_STATUSES.has(normalizedStatus)
    ? normalizedStatus
    : 'INVITED';
};

const mapInvitation = (invite) => ({
  id: invite.id,
  status: normalizeInvitationStatus(invite.status),
  group: {
    id: invite.group?.id,
    name: invite.group?.name ?? 'Untitled group',
    description: invite.group?.description ?? null,
  },
  inviter: invite.inviter ?? null,
  invitedAt: invite.invitedAt ?? invite.createdAt ?? null,
  respondedAt:
    invite.respondedAt ??
    invite.acceptedAt ??
    invite.declinedAt ??
    invite.expiredAt ??
    invite.updatedAt ??
    null,
  invitee:
    invite.invitee ??
    invite.recipient ??
    (invite.email
      ? {
          email: invite.email,
          displayName: invite.name ?? null,
        }
      : null),
  message: invite.message ?? invite.note ?? null,
});

export function useInvitations(options = {}) {
  return useAuthedApiQuery(INVITATIONS_QUERY_KEY, USER_INVITATIONS_PATH, {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: [],
    select: (data) => {
      const list = Array.isArray(data?.invitations) ? data.invitations : Array.isArray(data) ? data : [];
      return list.map(mapInvitation);
    },
    ...options,
  });
}
