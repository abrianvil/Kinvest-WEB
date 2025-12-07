import { useState } from 'react';
import { useInviteSearch } from './useInviteSearch';
import { useSendInvite } from './useSendInvite';
import InviteResultList from './InviteResultList';
import InviteForm from './InviteForm';
import { MIN_SEARCH_LENGTH } from './types';

export function InvitePanel({ groupId }) {
  const [query, setQuery] = useState('');
  const search = useInviteSearch({ groupId, query });
  const sendInvite = useSendInvite(groupId);

  const handleInviteResult = async (result) => {
    if (!result?.id) return;
    await sendInvite.mutateAsync({
      inviteeUserId: result.id,
      metadata: { source: 'dashboard-search' },
    });
  };

  const handleManualInvite = async (payload) => {
    await sendInvite.mutateAsync(payload);
  };

  return (
    <section className="space-y-6 rounded-3xl border border-line/80 bg-night-1/60 p-6 backdrop-blur">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Group invites</p>
        <h3 className="text-2xl font-semibold text-text-primary">Search &amp; invite members</h3>
        <p className="text-sm text-text-secondary">
          Owners and admins can search for existing Kinvest users or send manual invites. All actions
          require a valid Clerk session token.
        </p>
      </header>

      {!groupId ? (
        <div className="rounded-2xl border border-dashed border-line/50 bg-night-2/30 p-4 text-sm text-text-secondary">
          Select a group to manage invitations.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="invite-search" className="text-xs uppercase tracking-[0.4em] text-text-muted">
              Search members
            </label>
            <input
              id="invite-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Start typing a name, email, or phone"
              className="mt-2 w-full rounded-2xl border border-line bg-night-0/30 px-4 py-2 text-sm text-text-primary focus:border-accent-tech focus:outline-none"
            />
            <p className="mt-1 text-xs text-text-muted">
              Enter at least {MIN_SEARCH_LENGTH} characters to trigger search.
            </p>
          </div>

          {search.isError ? (
            <div className="rounded-2xl border border-warm-soft/50 bg-warm-soft/10 p-3 text-sm text-warm-light">
              Failed to search users. {search.error?.message ?? 'Please try again.'}
            </div>
          ) : null}

          {search.isFetching ? (
            <div className="rounded-2xl border border-accent-tech-soft/40 bg-accent-tech-soft/20 p-3 text-sm text-accent-tech">
              Searching…
            </div>
          ) : null}

          <InviteResultList
            results={search.data ?? []}
            onInvite={handleInviteResult}
            isInviting={sendInvite.isPending}
          />

          <InviteForm onSubmit={handleManualInvite} isSubmitting={sendInvite.isPending} />
        </div>
      )}
    </section>
  );
}

export default InvitePanel;
