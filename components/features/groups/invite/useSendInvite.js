import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '../../../../lib/apiClient';
import { inviteMutationKey, inviteSearchQueryKey } from './types';

const TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

const buildPayload = (payload) => {
  const { inviteeUserId, inviteeContact, role = 'MEMBER', metadata = {} } = payload ?? {};
  if (!inviteeUserId && !inviteeContact) {
    throw new Error('Provide either inviteeUserId or inviteeContact');
  }
  return {
    inviteeUserId,
    inviteeContact,
    role,
    metadata,
  };
};

export function useSendInvite(groupId) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const mutationKey = useMemo(() => inviteMutationKey(groupId), [groupId]);

  return useMutation({
    mutationKey,
    mutationFn: async (payload) => {
      if (!groupId) {
        throw new Error('Missing group id while sending invite');
      }
      const token = await getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
      if (!token) {
        throw new Error('Unable to fetch token for invite mutation');
      }
      const body = buildPayload(payload);
      return fetchFromApi(`/api/groups/${groupId}/invitations`, {
        token,
        method: 'POST',
        body,
      });
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({
        queryKey: inviteSearchQueryKey(groupId, ''),
        exact: false,
      });
      return context;
    },
  });
}
