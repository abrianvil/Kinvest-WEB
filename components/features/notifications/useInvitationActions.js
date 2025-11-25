import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFromApi } from '../../../lib/apiClient';
import {
  INVITATIONS_QUERY_KEY,
  USER_INVITATIONS_PATH,
} from './useInvitations';

const TEMPLATE =
  process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? undefined;

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INVITATIONS_QUERY_KEY,
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
