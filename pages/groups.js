import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import AppLayout from '../components/AppLayout';
import { InvitePanel } from '../components/features/groups/invite';
import { useCreateGroupModal } from '../components/features/groups/CreateGroupModalProvider';
import { PlusIcon } from '../components/icons';
import { useAuthedApiQuery } from '../hooks/useAuthedApiQuery';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

function GroupsPage({ user }) {
  const [activeGroupId, setActiveGroupId] = useState('');
  const [isInvitePanelOpen, setIsInvitePanelOpen] = useState(false);
  const { open } = useCreateGroupModal();
  const groupsQuery = useAuthedApiQuery(['groups', 'list'], '/api/groups');
  const availableGroups = useMemo(
    () => toArray(groupsQuery.data ?? []),
    [groupsQuery.data],
  );
  const userId = user?.id ?? null;

  const activeGroups = useMemo(() => {
    if (!userId) return [];

    return availableGroups.filter((group) => {
      if (!Array.isArray(group?.members)) return true;
      const selfMembership = group.members.find(
        (member) => member.userId === userId,
      );
      if (!selfMembership) return false;
      return (selfMembership.status ?? 'ACTIVE') === 'ACTIVE';
    });
  }, [availableGroups, userId]);

  const hasActiveSelection = useMemo(
    () => activeGroups.some((group) => group.id === activeGroupId),
    [activeGroupId, activeGroups],
  );
  const selectedGroupId = hasActiveSelection ? activeGroupId : '';

  const selectGroup = useCallback((groupId) => {
    const nextId = groupId || '';
    setActiveGroupId(nextId);
    if (nextId) {
      setIsInvitePanelOpen(true);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Groups • Kinvest</title>
      </Head>
      <AppLayout user={user}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line/70 bg-night-2/40 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Groups</p>
              <h1 className="text-3xl font-semibold text-text-primary">Collectives</h1>
              <p className="text-sm text-text-secondary">Create circles, then invite members when you are ready.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                open({
                  onCreated: (group) => {
                    if (group?.id) {
                      selectGroup(group.id);
                    }
                  },
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-accent-tech px-4 py-2 text-sm font-semibold text-accent-tech transition hover:text-accent-tech-dim"
            >
              <PlusIcon className="h-4 w-4" />
              New group
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="space-y-4 rounded-3xl border border-line/70 bg-night-2/40 p-5 backdrop-blur">
              <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-text-muted">
                  Groups workspace
                </p>
                <h2 className="text-3xl font-semibold text-text-primary">
                  Invite collaborators
                </h2>
                <p className="text-sm text-text-secondary">
                  Search for members or send manual invites. Pick a group you manage to get started.
                </p>
              </header>
              {isInvitePanelOpen ? (
                <>
                  <div>
                    <label
                      htmlFor="active-group"
                      className="text-xs uppercase tracking-[0.4em] text-text-muted"
                    >
                      Manage invites for
                    </label>
                    {groupsQuery.isLoading ? (
                      <p className="mt-3 text-sm text-text-secondary">
                        Loading your groups…
                      </p>
                    ) : activeGroups.length ? (
                      <select
                        id="active-group"
                        value={selectedGroupId}
                        onChange={(event) => selectGroup(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-line bg-night-0/20 px-4 py-2 text-sm text-text-primary focus:border-accent-tech focus:outline-none"
                      >
                        <option value="" disabled>
                          Select a group
                        </option>
                        {activeGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name ?? 'Untitled group'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-3 text-sm text-text-secondary">
                        You are not a member of any groups yet.
                      </p>
                    )}
                </div>
                  <InvitePanel groupId={selectedGroupId || null} />
                </>
              ) : (
                <div className="rounded-2xl border border-line/60 bg-night-1/40 p-4 text-sm">
                  <p className="text-text-secondary">
                    Select a group to start inviting members, or create a new collective first.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInvitePanelOpen(true)}
                      className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary hover:border-accent-tech hover:text-accent-tech"
                    >
                      Choose group
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        open({
                          onCreated: (group) => {
                            if (group?.id) {
                              selectGroup(group.id);
                            }
                          },
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-accent-tech px-3 py-1 text-xs font-semibold text-accent-tech hover:text-accent-tech-dim"
                    >
                      <PlusIcon className="h-4 w-4" />
                      New group
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-3xl border border-line/70 bg-night-2/40 p-5 backdrop-blur">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-text-muted">
                    Your groups
                  </p>
                  <h3 className="text-2xl font-semibold text-text-primary">
                    Active memberships
                  </h3>
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary">
                  {activeGroups.length} total
                </span>
              </header>
              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {activeGroups.length ? (
                  activeGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between rounded-2xl border border-line/70 bg-night-1/50 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {group.name ?? 'Untitled group'}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {group.role ?? group.membershipRole ?? 'MEMBER'} •{' '}
                          {group.memberCount ?? group.members?.length ?? '—'} members
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => selectGroup(group.id)}
                          className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary transition hover:border-accent-tech hover:text-accent-tech"
                        >
                          Manage invites
                        </button>
                        <Link
                          href={`/groups/${group.id}`}
                          className="rounded-full border border-accent-tech px-3 py-1 text-xs font-semibold text-accent-tech transition hover:text-accent-tech-dim"
                        >
                          View detail
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-secondary">
                    No groups to display yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) {
    return {
      redirect: { destination: '/sign-in', permanent: false },
    };
  }
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const serializableUser = JSON.parse(JSON.stringify(user));
  return { props: { user: serializableUser } };
};

export default GroupsPage;
