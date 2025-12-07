export const INVITATION_STATUS_LABELS = {
  INVITED: 'Invited',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
};

export const formatInvitationDate = (value, options = {}) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const locale = options.locale ?? 'en-US';
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    ...(options.includeTime
      ? {
          hour: 'numeric',
          minute: 'numeric',
        }
      : null),
  });
  return formatter.format(date);
};

export const getInvitationStatusLabel = (status) =>
  INVITATION_STATUS_LABELS[status] ?? INVITATION_STATUS_LABELS.INVITED;
