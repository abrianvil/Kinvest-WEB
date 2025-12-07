import { useState } from 'react';
import { useCreateGroup } from './useCreateGroup';
import { useGenerateGroupCycles } from './useGenerateGroupCycles';

const FREQUENCY_OPTIONS = ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'];
const ROTATION_OPTIONS = ['FIXED_ORDER', 'BIDDING', 'RANDOM', 'NEED_BASED'];

const defaultFormState = {
  name: '',
  description: '',
  templateId: '',
  contributionAmount: '',
  currency: 'USD',
  frequency: 'MONTHLY',
  slotCount: 5,
  rotationStrategy: 'FIXED_ORDER',
  lateFeePercent: '',
  gracePeriodDays: 0,
  cycleStartDate: '',
};

const clampNumber = (value, min, max) => {
  if (value === '' || value === null || value === undefined) return '';
  let next = Number(value);
  if (Number.isNaN(next)) return '';
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
};

function validatePayload(payload) {
  const errors = {};
  if (!payload.name || payload.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }
  if (payload.name && payload.name.length > 140) {
    errors.name = 'Name must be 140 characters or less';
  }
  if (payload.description && payload.description.length > 500) {
    errors.description = 'Description must be 500 characters or less';
  }
  if (!payload.contributionAmount || payload.contributionAmount <= 0) {
    errors.contributionAmount = 'Contribution amount must be greater than 0';
  }
  if (!payload.currency || payload.currency.length !== 3) {
    errors.currency = 'Currency must be a 3-letter code';
  }
  if (!payload.slotCount || payload.slotCount < 2 || payload.slotCount > 50) {
    errors.slotCount = 'Slots must be between 2 and 50';
  }
  if (payload.lateFeePercent != null) {
    if (payload.lateFeePercent < 0 || payload.lateFeePercent > 100) {
      errors.lateFeePercent = 'Late fee must be between 0 and 100';
    }
  }
  if (
    payload.gracePeriodDays != null &&
    (payload.gracePeriodDays < 0 || payload.gracePeriodDays > 30)
  ) {
    errors.gracePeriodDays = 'Grace period must be between 0 and 30 days';
  }
  return errors;
}

export function CreateGroupForm({ onCreated }) {
  const [formState, setFormState] = useState(defaultFormState);
  const [errors, setErrors] = useState({});
  const createGroup = useCreateGroup();
  const generateCycles = useGenerateGroupCycles();
  const isSubmitting = createGroup.isPending || generateCycles.isPending;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formState.name.trim(),
      description: formState.description?.trim() || undefined,
      templateId: formState.templateId?.trim() || undefined,
      contributionAmount: Number(formState.contributionAmount),
      currency: formState.currency.trim().toUpperCase(),
      frequency: formState.frequency,
      slotCount: Number(formState.slotCount),
      rotationStrategy: formState.rotationStrategy,
      lateFeePercent:
        formState.lateFeePercent === ''
          ? undefined
          : Number(formState.lateFeePercent),
      gracePeriodDays:
        formState.gracePeriodDays === ''
          ? undefined
          : Number(formState.gracePeriodDays),
    };

    const validationErrors = validatePayload(payload);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    let createdGroup = null;
    try {
      createdGroup = await createGroup.mutateAsync(payload);
      if (formState.cycleStartDate) {
        await generateCycles.mutateAsync({
          groupId: createdGroup.id,
          startDate: formState.cycleStartDate,
          iterations:Number(formState.slotCount),
        });
      }
      setFormState(defaultFormState);
      if (onCreated) {
        onCreated(createdGroup);
      }
    } catch (error) {
      if (createdGroup) {
        setFormState(defaultFormState);
        setErrors({ submit: 'Group created, but unable to schedule cycles automatically.' });
        if (onCreated) {
          onCreated(createdGroup);
        }
      } else {
        setErrors({ submit: error.message ?? 'Unable to create group' });
      }
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-line/70 bg-night-2/70 p-5 backdrop-blur">
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">
          Create a group
        </p>
        <h2 className="text-[22px] font-semibold text-text-primary">
          Launch a new collective
        </h2>
        <p className="text-sm text-text-secondary">
          Define contribution plan, frequency, and rotation. You can invite members after.
        </p>
      </header>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Name</span>
            <input
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
              placeholder="Ex: Copper Circle"
              required
            />
            {errors.name ? (
              <span className="text-xs text-warm-light">{errors.name}</span>
            ) : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Currency</span>
            <input
              name="currency"
              value={formState.currency}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  currency: event.target.value.toUpperCase(),
                }))
              }
              className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 uppercase text-text-primary focus:border-accent-tech-dim focus:outline-none"
              maxLength={3}
              required
            />
            {errors.currency ? (
              <span className="text-xs text-warm-light">{errors.currency}</span>
            ) : null}
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span className="text-text-secondary">Description</span>
          <textarea
            name="description"
            value={formState.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
            rows={3}
            placeholder="Optional context for organizers"
          />
          {errors.description ? (
            <span className="text-xs text-warm-light">{errors.description}</span>
          ) : null}
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Contribution amount</span>
            <input
            name="contributionAmount"
            type="number"
            min="0"
            step="0.01"
            value={formState.contributionAmount}
            onChange={handleNumberChange}
            className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
            placeholder="100"
            required
          />
            {errors.contributionAmount ? (
              <span className="text-xs text-warm-light">
                {errors.contributionAmount}
              </span>
            ) : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Frequency</span>
            <select
            name="frequency"
            value={formState.frequency}
            onChange={handleChange}
            className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
          >
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Rotation strategy</span>
            <select
            name="rotationStrategy"
            value={formState.rotationStrategy}
            onChange={handleChange}
            className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
          >
            {ROTATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Slots</span>
            <input
              name="slotCount"
              type="number"
              min="2"
              max="50"
              value={formState.slotCount}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  slotCount: clampNumber(event.target.value, 2, 50),
                }))
              }
              className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
            />
            {errors.slotCount ? (
              <span className="text-xs text-warm-light">{errors.slotCount}</span>
            ) : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Late fee %</span>
            <input
              name="lateFeePercent"
              type="number"
              min="0"
              max="100"
              value={formState.lateFeePercent}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  lateFeePercent: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
            />
            {errors.lateFeePercent ? (
              <span className="text-xs text-warm-light">
                {errors.lateFeePercent}
              </span>
            ) : null}
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Grace period (days)</span>
            <input
              name="gracePeriodDays"
              type="number"
              min="0"
              max="30"
              value={formState.gracePeriodDays}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  gracePeriodDays: clampNumber(event.target.value, 0, 30),
                }))
              }
              className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
            />
            {errors.gracePeriodDays ? (
              <span className="text-xs text-warm-light">
                {errors.gracePeriodDays}
              </span>
            ) : null}
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span className="text-text-secondary">Cycle start date</span>
          <input
            name="cycleStartDate"
            type="date"
            value={formState.cycleStartDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
          />
          <span className="text-xs text-text-muted">Optional: schedule the first rotation immediately.</span>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-text-secondary">Template ID (optional)</span>
          <input
            name="templateId"
            value={formState.templateId}
            onChange={handleChange}
            className="w-full rounded-lg border border-line bg-night-3/70 px-3 py-2 text-text-primary focus:border-accent-tech-dim focus:outline-none"
            placeholder="cuid..."
          />
          </label>
        </div>

        {errors.submit ? (
          <p className="text-sm text-warm-light">{errors.submit}</p>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-md px-6 py-2 text-sm font-semibold transition ${
              isSubmitting
                ? 'cursor-not-allowed border-line text-text-muted'
                : 'bg-warm-1 text-night-0 hover:bg-warm-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-1'
            }`}
          >
            {isSubmitting ? 'Creating…' : 'Create group'}
          </button>
          {createGroup.isSuccess && !generateCycles.isPending ? (
            <span className="text-sm text-text-secondary">
              Group created.
            </span>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export default CreateGroupForm;
