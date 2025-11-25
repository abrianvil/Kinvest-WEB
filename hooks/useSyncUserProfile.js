import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

const SYNC_ENDPOINT = '/api/bootstrap/user';
const TOKEN_TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE;

export function useSyncUserProfile() {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!authLoaded || !userLoaded) return;
    if (!isSignedIn || !user) return;
    if (hasSyncedRef.current) return;

    const controller = new AbortController();
    const syncUser = async () => {
      try {
        const token = await getToken(
          TOKEN_TEMPLATE ? { template: TOKEN_TEMPLATE } : undefined,
        );
        if (!token) {
          throw new Error('Unable to fetch Clerk token for API sync.');
        }

        const payload = {
          displayName: user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress,
          avatarUrl: user.imageUrl,
          locale: user.primaryLocale ?? 'en',
        };

        const response = await fetch(SYNC_ENDPOINT, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          throw new Error(errorPayload?.error || 'Failed to sync user profile');
        }

        hasSyncedRef.current = true;
      } catch (error) {
        if (controller.signal.aborted) return;
      }
    };

    syncUser();

    return () => controller.abort();
  }, [authLoaded, userLoaded, isSignedIn, user, getToken]);
}
