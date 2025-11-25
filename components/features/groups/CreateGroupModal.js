import { useEffect } from 'react';
import { CreateGroupForm } from './CreateGroupForm';
import { CloseIcon } from '../../icons';

export function CreateGroupModal({ isOpen, onClose, onCreated }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-0/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line/80 bg-night-1/90 p-6 shadow-techGlow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Create a group</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-sm text-text-secondary hover:border-accent-tech hover:text-accent-tech"
            aria-label="Close create group"
          >
            <CloseIcon className="h-4 w-4" />
            Close
          </button>
        </div>
        <div className="mt-4">
          <CreateGroupForm
            onCreated={(group) => {
              onCreated?.(group);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
