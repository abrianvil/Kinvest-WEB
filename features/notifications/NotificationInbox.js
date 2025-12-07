import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useInvitations } from './useInvitations';
import { getInvitationStatusLabel, formatInvitationDate } from './constants';
import { useInvitationActions } from './useInvitationActions';
import { BellIcon } from '../../components/icons';

function InvitationsList({
  invitations,
  isLoading,
  isError,
  onAccept,
  onDecline,
  hasPendingAction,
  acceptingId,
  decliningId,
}) {
  if (isLoading) {
    return <p className="text-text-secondary">Loading invitations…</p>;
  }

  if (isError) {
    return <p className="text-warm-light">Unable to load invitations.</p>;
  }

  if (!invitations.length) {
    return <p className="text-text-secondary">No invitations right now.</p>;
  }

  return (
    <ul className="space-y-3">
      {invitations.map((invite) => (
        <li
          key={invite.id}
          className="rounded-2xl border border-line/70 bg-night-0/40 p-3"
        >
          <p className="text-sm font-semibold text-text-primary">
            {invite.group?.name ?? 'Group invitation'}
          </p>
          <p className="text-xs text-text-secondary">
            {invite.inviter?.displayName ??
              invite.inviter?.name ??
              'Group owner'}
            {invite.invitedAt
              ? ` • ${formatInvitationDate(invite.invitedAt)}`
              : ''}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="rounded-full border border-line px-2 py-0.5 text-text-muted">
              {getInvitationStatusLabel(invite.status)}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {invite.id && invite.status === 'INVITED' ? (
                <>
                  <button
                    type="button"
                    onClick={() => onAccept(invite.id)}
                    disabled={!invite.id || hasPendingAction}
                    className="rounded-full border border-accent-tech px-3 py-0.5 text-[11px] font-semibold text-accent-tech transition hover:text-accent-tech-dim disabled:cursor-not-allowed disabled:border-line disabled:text-text-muted"
                  >
                    {acceptingId === invite.id ? 'Accepting…' : 'Accept'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDecline(invite.id)}
                    disabled={!invite.id || hasPendingAction}
                    className="rounded-full border border-line px-3 py-0.5 text-[11px] font-semibold text-text-secondary transition hover:border-warm hover:text-warm disabled:cursor-not-allowed disabled:text-text-muted"
                  >
                    {decliningId === invite.id ? 'Declining…' : 'Decline'}
                  </button>
                </>
              ) : null}
              {invite.id ? (
                <Link
                  href={`/invitations/${encodeURIComponent(invite.id)}`}
                  className="text-accent-tech hover:text-accent-tech-dim"
                >
                  View invitation
                </Link>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NotificationInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const shouldRestoreFocusRef = useRef(false);

  const {
    data: invitations = [],
    isLoading,
    isError,
    refetch,
  } = useInvitations({
    enabled: true,
  });
  const { acceptInvitation, declineInvitation } = useInvitationActions();
  const acceptingId = acceptInvitation.isPending
    ? acceptInvitation.variables
    : null;
  const decliningId = declineInvitation.isPending
    ? declineInvitation.variables
    : null;
  const hasPendingAction = Boolean(acceptingId || decliningId);

  const unreadCount = useMemo(
    () =>
      invitations.filter((invite) => invite.status === 'INVITED').length,
    [invitations],
  );

  const hasUnread = unreadCount > 0;
  const hasActionable = invitations.some(
    (invite) => invite.status === 'INVITED',
  );

  const handleAccept = useCallback(
    (invitationId) => {
      if (!invitationId || hasPendingAction) return;
      acceptInvitation.mutate(invitationId);
    },
    [acceptInvitation, hasPendingAction],
  );

  const handleDecline = useCallback(
    (invitationId) => {
      if (!invitationId || hasPendingAction) return;
      declineInvitation.mutate(invitationId);
    },
    [declineInvitation, hasPendingAction],
  );

  const closeInbox = useCallback(
    (options = {}) => {
      const { restoreFocus = true } = options;
      shouldRestoreFocusRef.current = restoreFocus;
      setIsOpen(false);
    },
    [setIsOpen],
  );

  const toggleInbox = () => {
    if (isOpen) {
      closeInbox();
    } else {
      shouldRestoreFocusRef.current = false;
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleMouseDown = (event) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target)) return;
      closeInbox({ restoreFocus: false });
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeInbox({ restoreFocus: true });
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeInbox]);

  useEffect(() => {
    if (isOpen) {
      if (panelRef.current) {
        panelRef.current.focus();
      }
      return;
    }

    if (shouldRestoreFocusRef.current && buttonRef.current) {
      buttonRef.current.focus();
    }

    shouldRestoreFocusRef.current = false;
  }, [isOpen]);

  const baseButtonClasses =
    'relative flex items-center gap-2 rounded-full px-3 py-1 text-sm transition';
  let buttonClass;

  if (isOpen) {
    buttonClass = `${baseButtonClasses} border border-accent-tech text-accent-tech`;
  } else if (hasUnread) {
    buttonClass = `${baseButtonClasses} border border-accent-tech text-accent-tech notification-glow`;
  } else {
    buttonClass = `${baseButtonClasses} border border-line text-text-secondary hover:border-accent-tech hover:text-accent-tech`;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleInbox}
        className={buttonClass}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="notification-inbox-panel"
        ref={buttonRef}
      >
        <span className="flex items-center gap-1">
          <BellIcon className="h-4 w-4 text-text-secondary" />
          <span>Notifications</span>
          {hasUnread && !isOpen ? (
            <span
              className="h-2 w-2 rounded-full bg-accent-tech animate-pulse"
              aria-hidden="true"
            />
          ) : null}
        </span>
        {hasActionable ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              hasUnread
                ? 'bg-[#ff5e87] text-night-0'
                : 'bg-line text-text-primary'
            }`}
            aria-label={`${hasUnread ? unreadCount : invitations.length} notifications`}
          >
            {hasUnread ? unreadCount : invitations.length}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          id="notification-inbox-panel"
          role="menu"
          className="absolute right-0 z-20 mt-3 w-80 rounded-3xl border border-line/80 bg-night-1/80 p-4 text-sm shadow-card backdrop-blur"
          tabIndex={-1}
          ref={panelRef}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">
                Inbox
              </p>
              <h4 className="text-base font-semibold text-text-primary">
                Invitations
              </h4>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className={`text-xs ${
                isLoading
                  ? 'cursor-not-allowed text-text-muted'
                  : 'text-accent-tech hover:text-accent-tech-dim'
              }`}
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <InvitationsList
            invitations={invitations}
            isLoading={isLoading}
            isError={isError}
            onAccept={handleAccept}
            onDecline={handleDecline}
            hasPendingAction={hasPendingAction}
            acceptingId={acceptingId}
            decliningId={decliningId}
          />
        </div>
      ) : null}
    </div>
  );
}

export default NotificationInbox;









// import { useEffect, useMemo, useRef, useState } from 'react';
// import Link from 'next/link';
// import { useInvitations } from './useInvitations';

// const statusLabels = {
//   PENDING: 'Pending',
//   ACCEPTED: 'Accepted',
//   DECLINED: 'Declined',
//   EXPIRED: 'Expired',
// };

// function formatDate(value) {
//   if (!value) return '';
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return '';
//   return new Intl.DateTimeFormat('en-US', {
//     month: 'short',
//     day: 'numeric',
//   }).format(date);
// }

// export function NotificationInbox() {
//   const [isOpen, setIsOpen] = useState(false);
//   const containerRef = useRef(null);
//   const { data: invitations = [], isLoading, isError, refetch } = useInvitations({
//     enabled: true,
//   });

//   const unreadCount = useMemo(
//     () => invitations.filter((invite) => invite.status === 'INVITED').length,
//     [invitations],
//   );
//   const hasUnread = unreadCount > 0;
//   const hasActionable = invitations.some((invite) => invite.status === 'PENDING' || invite.status === 'INVITED');

//   useEffect(() => {
//     if (!isOpen) return undefined;
//     const handler = (event) => {
//       if (!containerRef.current) return;
//       if (containerRef.current.contains(event.target)) return;
//       setIsOpen(false);
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, [isOpen]);

//   const buttonClass = (() => {
//     if (isOpen) {
//       return 'relative flex items-center gap-2 rounded-full border border-accent-tech px-3 py-1 text-sm text-accent-tech transition';
//     }
//     if (hasUnread) {
//       return 'relative flex items-center gap-2 rounded-full border border-accent-tech px-3 py-1 text-sm text-accent-tech notification-glow';
//     }
//     return 'relative flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm text-text-secondary transition hover:border-accent-tech hover:text-accent-tech';
//   })();

//   return (
//     <div className="relative" ref={containerRef}>
//       <button
//         type="button"
//         onClick={() => setIsOpen((current) => !current)}
//         className={buttonClass}
//         aria-expanded={isOpen}
//         aria-haspopup="true"
//       >
//         <span className="flex items-center gap-1">
//           <span>Notifications</span>
//           {hasUnread && !isOpen ? (
//             <span className="h-2 w-2 rounded-full bg-accent-tech animate-pulse" aria-hidden="true" />
//           ) : null}
//         </span>
//         {hasActionable ? (
//           <span
//             className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
//               hasUnread ? 'bg-[#ff5e87] text-night-0' : 'bg-line text-text-primary'
//             }`}
//           >
//             {hasUnread ? unreadCount : invitations.length}
//           </span>
//         ) : null}
//       </button>

//       {isOpen ? (
//         <div className="absolute right-0 z-20 mt-3 w-80 rounded-3xl border border-line/80 bg-night-1/80 p-4 text-sm shadow-card backdrop-blur">
//           <div className="mb-3 flex items-center justify-between">
//             <div>
//               <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Inbox</p>
//               <h4 className="text-base font-semibold text-text-primary">Invitations</h4>
//             </div>
//             <button
//               type="button"
//               onClick={() => refetch()}
//               className="text-xs text-accent-tech hover:text-accent-tech-dim"
//             >
//               Refresh
//             </button>
//           </div>

//           {isLoading ? (
//             <p className="text-text-secondary">Loading invitations…</p>
//           ) : isError ? (
//             <p className="text-warm-light">Unable to load invitations.</p>
//           ) : invitations.length ? (
//             <ul className="space-y-3">
//               {invitations.map((invite) => (
//                 <li
//                   key={invite.id}
//                   className="rounded-2xl border border-line/70 bg-night-0/40 p-3"
//                 >
//                   <p className="text-sm font-semibold text-text-primary">
//                     {invite.group?.name ?? 'Group invitation'}
//                   </p>
//                   <p className="text-xs text-text-secondary">
//                     {invite.inviter?.displayName ?? invite.inviter?.name ?? 'Group owner'}
//                     {invite.invitedAt ? ` • ${formatDate(invite.invitedAt)}` : ''}
//                   </p>
//                   <div className="mt-2 flex items-center justify-between text-xs">
//                     <span className="rounded-full border border-line px-2 py-0.5 text-text-muted">
//                       {statusLabels[invite.status] ?? invite.status ?? 'Pending'}
//                     </span>
//                     {invite.group?.id ? (
//                       <Link
//                         href={`/groups?active=${invite.group.id}`}
//                         className="text-accent-tech hover:text-accent-tech-dim"
//                       >
//                         View group
//                       </Link>
//                     ) : null}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-text-secondary">No invitations right now.</p>
//           )}
//         </div>
//       ) : null}
//     </div>
//   );
// }

// export default NotificationInbox;
