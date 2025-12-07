import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRecordContribution } from './useRecordContribution';

const DEFAULT_STATE = {
  amount: '',
  walletId: '',
};

function ModalBody({
  onClose,
  groupId,
  cycleOptions = [],
  defaultAmount,
  selectedCycleIdInitial,
  amountInitial,
}) {
  const [formState, setFormState] = useState({ amount: amountInitial, walletId: '' });
  const [selectedCycleId, setSelectedCycleId] = useState(selectedCycleIdInitial);
  const [errorMessage, setErrorMessage] = useState('');
  const recordContribution = useRecordContribution();

  const selectedCycle = cycleOptions.find((cycle) => cycle.id === selectedCycleId) || cycleOptions[0];
  const hasContributed = selectedCycle?.hasContributed ?? false;
  const amountValue = Number(formState.amount);
  const amountIsValid = Number.isFinite(amountValue) && amountValue > 0;

  const dialogTitleId = 'record-contribution-title';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (hasContributed) return;
    if (!amountIsValid) {
      setErrorMessage('Enter a contribution amount greater than 0.');
      return;
    }
    if (!selectedCycleId && !cycleOptions[0]?.id) {
      setErrorMessage('No cycle is available for recording this contribution.');
      return;
    }
    try {
      await recordContribution.mutateAsync({
        groupId,
        cycleId: selectedCycleId || cycleOptions[0]?.id,
        amount: amountValue,
        walletId: formState.walletId || undefined,
      });
      onClose?.();
    } catch (error) {
      setErrorMessage(error?.message ?? 'Unable to record contribution. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-night-0/70 p-4 py-10 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-line/80 bg-night-1/95 shadow-techGlow"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 md:px-7">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Contribution</p>
            <h3 id={dialogTitleId} className="text-xl font-semibold text-text-primary">
              Record payment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1 text-sm text-text-secondary hover:border-accent-tech hover:text-accent-tech"
          >
            Close
          </button>
        </div>
        <form
          className="max-h-[78vh] space-y-4 overflow-y-auto px-6 pb-6 pr-5 kin-scroll md:px-7 md:pb-7"
          onSubmit={handleSubmit}
        >
          {cycleOptions.length ? (
            <label className="space-y-1 text-sm">
              <span className="text-text-secondary">Cycle</span>
              <select
                value={selectedCycleId}
                onChange={(event) => setSelectedCycleId(event.target.value)}
                className="w-full rounded-2xl border border-line bg-night-0/20 px-3 py-2 text-text-primary focus:border-accent-tech focus:outline-none"
              >
                {cycleOptions.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    Cycle {cycle.number} • {cycle.date ?? ''}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.amount}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  amount: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-line bg-night-0/20 px-3 py-2 text-text-primary focus:border-accent-tech focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Wallet (optional)</span>
            <input
              value={formState.walletId}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  walletId: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-line bg-night-0/20 px-3 py-2 text-text-primary focus:border-accent-tech focus:outline-none"
              placeholder="Wallet ID"
            />
          </label>
          <button
            type="submit"
            disabled={recordContribution.isPending || hasContributed}
            className={`w-full rounded-full border px-4 py-2 text-sm font-semibold transition ${
              recordContribution.isPending || hasContributed
                ? 'cursor-not-allowed border-line text-text-muted'
                : 'border-accent-tech text-accent-tech hover:text-accent-tech-dim'
            }`}
          >
            {hasContributed
              ? 'Already recorded'
              : recordContribution.isPending
              ? 'Recording…'
              : 'Record contribution'}
          </button>
          {errorMessage ? (
            <p className="text-center text-xs text-warm-light">{errorMessage}</p>
          ) : null}
          {hasContributed ? (
            <p className="text-xs text-text-secondary text-center">
              You have already contributed to this cycle.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

export function RecordContributionModal({
  isOpen,
  onClose,
  groupId,
  cycleOptions = [],
  defaultAmount,
}) {
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const selectedCycleIdInitial = cycleOptions[0]?.id ?? '';
  const amountInitial = defaultAmount ? String(defaultAmount) : DEFAULT_STATE.amount;
  const portalTarget = document.body ?? document.getElementById('__next');
  const modalKey = `${groupId ?? 'group'}-${selectedCycleIdInitial}-${amountInitial}`;

  if (!portalTarget) return null;

  return createPortal(
    <ModalBody
      key={modalKey}
      onClose={onClose}
      groupId={groupId}
      cycleOptions={cycleOptions}
      defaultAmount={defaultAmount}
      selectedCycleIdInitial={selectedCycleIdInitial}
      amountInitial={amountInitial}
    />,
    portalTarget,
  );
}

export default RecordContributionModal;
