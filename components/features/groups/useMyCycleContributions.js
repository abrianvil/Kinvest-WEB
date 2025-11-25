import { useMemo } from 'react';
import { useAuthedApiQuery } from '../../../hooks/useAuthedApiQuery';

export function useMyCycleContributions(groupId) {
  const path = groupId
    ? `/api/groups/${encodeURIComponent(groupId)}/me/cycles`
    : null;
  const query = useAuthedApiQuery(
    ['groups', groupId ?? 'unknown', 'my-cycles'],
    path,
    {
      enabled: Boolean(groupId),
      placeholderData: [],
    },
  );

  return useMemo(() => ({
    ...query,
    data: Array.isArray(query.data) ? query.data : [],
  }), [query]);
}

export default useMyCycleContributions;
