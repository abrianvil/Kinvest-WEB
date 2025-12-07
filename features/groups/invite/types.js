export const INVITE_MEMBER_ROLES = ['OWNER', 'ADMIN', 'MEMBER'];

export const INVITE_STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
};

export const MEMBERSHIP_STATUS_LABELS = {
  ACTIVE: 'Active',
  INVITED: 'Invited',
  LEFT: 'Left',
  REMOVED: 'Removed',
  NONE: 'Not a member',
};

export const inviteSearchQueryKey = (groupId, query) => [
  'groups',
  groupId ?? 'unknown',
  'invite-search',
  query ?? '',
];

export const inviteMutationKey = (groupId) => ['groups', groupId ?? 'unknown', 'invite-create'];

export const MIN_SEARCH_LENGTH = 2;
