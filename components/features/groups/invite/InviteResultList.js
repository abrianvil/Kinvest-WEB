import { INVITE_STATUS_LABELS, MEMBERSHIP_STATUS_LABELS } from './types';

function InviteActionButton({ result, onInvite, isInviting }) {
  const disabled =
    result.alreadyMember ||
    result.inviteStatus === 'PENDING' ||
    result.membershipStatus === 'ACTIVE' ||
    isInviting;
  const label = result.alreadyMember
    ? 'Member'
    : result.inviteStatus === 'PENDING'
    ? 'Pending'
    : 'Invite';

  return (
    <button
      type="button"
      onClick={() => onInvite(result)}
      disabled={disabled}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        disabled
          ? 'border-line/60 text-text-muted cursor-not-allowed'
          : 'border-accent-tech-soft text-accent-tech hover:bg-accent-tech-soft/20'
      }`}
    >
      {isInviting && !disabled ? 'Sending…' : label}
    </button>
  );
}

export function InviteResultList({ results = [], onInvite, isInviting }) {
  if (!results.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line/50 bg-night-2/30 p-4 text-sm text-text-muted">
        Start typing to search for members by email, phone, or name.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {results.map((result) => (
        <li
          key={result.id ?? result.email ?? result.phone}
          className="flex items-center justify-between rounded-2xl border border-line/60 bg-night-2/40 p-3"
        >
          <div className="flex items-center gap-3">
            {result.avatarUrl ? (
              <img src={result.avatarUrl} alt={result.displayName ?? 'User avatar'} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-night-0/60 text-sm font-semibold text-text-secondary">
                {(result.displayName ?? result.email ?? result.phone ?? '?').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-text-primary">{result.displayName ?? 'Unnamed user'}</p>
              <p className="text-xs text-text-muted break-all">{result.email ?? result.phone ?? 'No contact on file'}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-line/70 px-2 py-0.5 text-text-secondary">
                  {MEMBERSHIP_STATUS_LABELS[result.membershipStatus] ?? 'Status unknown'}
                </span>
                {result.inviteStatus ? (
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      result.inviteStatus === 'PENDING'
                        ? 'bg-accent-tech/15 text-accent-tech border border-accent-tech/40'
                        : 'border border-line/70 text-text-muted'
                    }`}
                  >
                    {INVITE_STATUS_LABELS[result.inviteStatus] ?? result.inviteStatus}
                  </span>
                ) : null}
                {result.isBlocked ? (
                  <span className="rounded-full border border-warm px-2 py-0.5 text-warm-light">Blocked</span>
                ) : null}
              </div>
            </div>
          </div>
          <InviteActionButton result={result} onInvite={onInvite} isInviting={isInviting} />
        </li>
      ))}
    </ul>
  );
}

export default InviteResultList;
