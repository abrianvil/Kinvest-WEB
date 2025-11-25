import { useEffect, useState } from 'react';
import { useRecordContribution } from './useRecordContribution';

const DEFAULT_STATE = {
  amount: '',
  walletId: '',
};

export function RecordContributionModal({
  isOpen,
  onClose,
  groupId,
  cycleOptions = [],
  defaultAmount,
}) {
  const [formState, setFormState] = useState(DEFAULT_STATE);
  const [selectedCycleId, setSelectedCycleId] = useState(cycleOptions[0]?.id ?? '');
  const recordContribution = useRecordContribution();

  useEffect(() => {
    if (cycleOptions.length) {
      setSelectedCycleId(cycleOptions[0].id);
    }
  }, [cycleOptions]);

  useEffect(() => {
    if (!isOpen) {
      setFormState(DEFAULT_STATE);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormState((prev) => ({
        ...prev,
        amount: defaultAmount ? String(defaultAmount) : prev.amount,
      }));
    }
  }, [isOpen, defaultAmount]);

  if (!isOpen) return null;

  const selectedCycle = cycleOptions.find((cycle) => cycle.id === selectedCycleId) || cycleOptions[0];
  const hasContributed = selectedCycle?.hasContributed ?? false;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (hasContributed) return;
    try {
      await recordContribution.mutateAsync({
        groupId,
        cycleId: selectedCycleId || cycleOptions[0]?.id,
        amount: Number(formState.amount),
        walletId: formState.walletId || undefined,
      });
      onClose?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-0/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-line/80 bg-night-1/90 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Contribution</p>
            <h3 className="text-xl font-semibold text-text-primary">Record payment</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1 text-sm text-text-secondary hover:border-accent-tech hover:text-accent-tech"
          >
            Close
          </button>
        </div>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
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

export default RecordContributionModal;
