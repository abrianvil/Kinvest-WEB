import { useState } from 'react';

const CONTACT_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
  phone: /^[+]?\d[\d\s-]{6,}$/,
};

export function InviteForm({ onSubmit, isSubmitting }) {
  const [contact, setContact] = useState('');
  const [error, setError] = useState(null);

  const resetForm = () => {
    setContact('');
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = contact.trim();
    if (!trimmed) {
      setError('Provide an email or phone number.');
      return;
    }
    const isEmail = CONTACT_PATTERNS.email.test(trimmed);
    const isPhone = CONTACT_PATTERNS.phone.test(trimmed);
    if (!isEmail && !isPhone) {
      setError('Enter a valid email address or phone number.');
      return;
    }

    setError(null);
    await onSubmit({
      inviteeContact: trimmed,
      metadata: { source: 'dashboard-manual' },
    });
    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-line/70 bg-night-2/50 p-4">
      <div>
        <label htmlFor="manual-contact" className="text-xs uppercase tracking-[0.3em] text-text-muted">
          Manual invite
        </label>
        <input
          id="manual-contact"
          type="text"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="email@example.com or +1 555 000 1234"
          className="mt-2 w-full rounded-2xl border border-line bg-night-0/30 px-3 py-2 text-sm text-text-primary focus:border-accent-tech focus:outline-none"
        />
      </div>
      {error ? <p className="text-xs text-warm-light">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
          isSubmitting
            ? 'border-line/60 bg-night-2/30 text-text-muted'
            : 'border-accent-tech-soft text-accent-tech hover:bg-accent-tech-soft/30'
        }`}
      >
        {isSubmitting ? 'Sending invite…' : 'Send invite'}
      </button>
    </form>
  );
}

export default InviteForm;
