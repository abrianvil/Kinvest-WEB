import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { AppLayout } from '../../components/layouts';
import { useInvitations, useInvitationActions } from '../../features/notifications';
import {
  getInvitationStatusLabel,
  formatInvitationDate,
} from '../../features/notifications/constants';

const formatDateWithFallback = (value) =>
  formatInvitationDate(value, { includeTime: true }) || 'Unknown date';

const buildTimelineEvents = (invitation) => {
  if (!invitation) return [];

  const inviterName =
    invitation.inviter?.displayName ??
    invitation.inviter?.name ??
    'Your group owner';

  const events = [
    {
      id: 'sent',
      title: 'Invitation sent',
      timestamp: formatDateWithFallback(invitation.invitedAt),
      description: `Sent by ${inviterName}.`,
    },
  ];

  if (invitation.status !== 'INVITED') {
    events.push({
      id: 'status',
      title: getInvitationStatusLabel(invitation.status),
      timestamp: formatDateWithFallback(invitation.respondedAt ?? invitation.invitedAt),
      description: `Status updated to ${getInvitationStatusLabel(invitation.status).toLowerCase()}.`,
    });
  }

  return events;
};

function Timeline({ events }) {
  if (!events.length) {
    return (
      <p className="text-sm text-text-secondary">
        History will show here once there are updates to this invitation.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event, index) => (
        <li key={event.id ?? index} className="relative pl-7">
          <span className="absolute left-0 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-accent-tech bg-night-0 text-[10px] font-semibold text-accent-tech">
            {index + 1}
          </span>
          <p className="text-sm font-semibold text-text-primary">{event.title}</p>
          <p className="text-xs text-text-muted">{event.timestamp}</p>
          <p className="mt-1 text-sm text-text-secondary">{event.description}</p>
        </li>
      ))}
    </ol>
  );
}

function DetailsCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-night-0/30 p-4">
      <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-text-primary">{value ?? '—'}</p>
      {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
    </div>
  );
}

function InvitationDetailView({ user, initialInvitationId }) {
  const router = useRouter();
  const invitationId = (router.query?.invitationId ?? initialInvitationId ?? '').toString();

  const {
    data: invitations = [],
    isLoading,
    isError,
    refetch,
  } = useInvitations({
    enabled: true,
  });
  const { acceptInvitation, declineInvitation } = useInvitationActions();

  const invitation = useMemo(
    () => invitations.find((invite) => invite.id === invitationId),
    [invitations, invitationId],
  );

  const timelineEvents = useMemo(
    () => buildTimelineEvents(invitation),
    [invitation],
  );

  const statusLabel = invitation ? getInvitationStatusLabel(invitation.status) : 'Invitation';
  const invitedDate = invitation?.invitedAt
    ? formatInvitationDate(invitation.invitedAt, { includeTime: true })
    : 'Unknown date';

  const isAccepting =
    !!invitation?.id &&
    acceptInvitation.isPending &&
    acceptInvitation.variables === invitation.id;
  const isDeclining =
    !!invitation?.id &&
    declineInvitation.isPending &&
    declineInvitation.variables === invitation.id;

  const handleAccept = () => {
    if (!invitation?.id || isAccepting) return;
    acceptInvitation.mutate(invitation.id);
  };

  const handleDecline = () => {
    if (!invitation?.id || isDeclining) return;
    declineInvitation.mutate(invitation.id);
  };

  return (
    <>
      <Head>
        <title>
          {`${invitation ? `${invitation.group?.name ?? 'Invitation'} • History` : 'Invitation'} • Kinvest`}
        </title>
      </Head>
      <AppLayout user={user}>
        <section className="space-y-4 rounded-3xl border border-line/80 bg-night-2/40 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Invitation</p>
              <h1 className="text-3xl font-semibold text-text-primary">
                {invitation?.group?.name ?? 'Pending invitation'}
              </h1>
              <p className="text-sm text-text-secondary">
                Sent {invitedDate}
              </p>
            </div>
            <span className="rounded-full border border-accent-tech px-4 py-1 text-sm font-semibold text-accent-tech">
              {statusLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className={`rounded-full border px-4 py-1 text-sm transition ${
                isLoading
                  ? 'cursor-not-allowed border-line text-text-muted'
                  : 'border-line text-text-secondary hover:border-accent-tech hover:text-accent-tech'
              }`}
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            <Link
              href="/dashboard"
              className="rounded-full border border-line px-4 py-1 text-sm text-text-secondary transition hover:border-accent-tech hover:text-accent-tech"
            >
              Back to dashboard
            </Link>
            {invitation?.status === 'INVITED' && invitation?.id ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={!invitation?.id || isAccepting || isDeclining}
                  className="rounded-full border border-accent-tech px-4 py-1 text-sm font-semibold text-accent-tech transition hover:text-accent-tech-dim disabled:cursor-not-allowed disabled:border-line disabled:text-text-muted"
                >
                  {isAccepting ? 'Accepting…' : 'Accept invitation'}
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={!invitation?.id || isAccepting || isDeclining}
                  className="rounded-full border border-line px-4 py-1 text-sm font-semibold text-text-secondary transition hover:border-warm hover:text-warm disabled:cursor-not-allowed disabled:text-text-muted"
                >
                  {isDeclining ? 'Declining…' : 'Decline invitation'}
                </button>
              </div>
            ) : null}
            {invitation?.group?.id ? (
              <Link
                href={`/groups?active=${encodeURIComponent(invitation.group.id)}`}
                className="rounded-full border border-accent-tech px-4 py-1 text-sm text-accent-tech hover:text-accent-tech-dim"
              >
                View group
              </Link>
            ) : null}
          </div>
          {isError ? (
            <p className="text-sm text-warm-light">Unable to load the invitation right now.</p>
          ) : null}
          {!isLoading && !invitation ? (
            <p className="text-sm text-text-secondary">
              We could not find that invitation. It may have been rescinded or you may no longer have access.
            </p>
          ) : null}
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="space-y-4 rounded-3xl border border-line/80 bg-night-2/40 p-5 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">History</p>
              <h2 className="text-2xl font-semibold text-text-primary">Invitation timeline</h2>
            </div>
            <Timeline events={timelineEvents} />
          </section>

          <section className="space-y-4 rounded-3xl border border-line/80 bg-night-2/40 p-5 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Details</p>
              <h2 className="text-2xl font-semibold text-text-primary">Who&apos;s involved</h2>
            </div>
            <div className="space-y-4">
              <DetailsCard
                label="Group"
                value={invitation?.group?.name ?? 'Unknown group'}
                description={invitation?.group?.description ?? undefined}
              />
              <DetailsCard
                label="Invited by"
                value={
                  invitation?.inviter?.displayName ??
                  invitation?.inviter?.name ??
                  'Group owner'
                }
                description={invitation?.inviter?.email ?? undefined}
              />
              <DetailsCard
                label="Invitee"
                value={
                  invitation?.invitee?.displayName ??
                  invitation?.invitee?.name ??
                  invitation?.invitee?.email ??
                  'Pending recipient'
                }
                description={invitation?.invitee?.email ?? undefined}
              />
              {invitation?.message ? (
                <div className="rounded-2xl border border-line/70 bg-night-0/30 p-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Message</p>
                  <p className="mt-1 text-sm text-text-secondary">{invitation.message}</p>
                </div>
              ) : null}
            </div>
          </section>
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

  return {
    props: {
      user: serializableUser,
      initialInvitationId: ctx.params?.invitationId ?? null,
    },
  };
};

export default InvitationDetailView;
