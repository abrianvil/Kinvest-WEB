import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreateGroupForm } from './CreateGroupForm';
import { CloseIcon } from '../../components/icons';

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

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const portalTarget = document.body ?? document.getElementById('__next');

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const dialogTitleId = 'create-group-modal-title';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-night-0/70 p-4 py-10 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-line/80 bg-night-1/95 shadow-techGlow"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 md:px-7">
          <h2 id={dialogTitleId} className="text-xl font-semibold text-text-primary">
            Create a group
          </h2>
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
        <div className="max-h-[82vh] overflow-y-auto px-6 pb-6 pr-5 md:px-7 md:pb-7 kin-scroll">
          <CreateGroupForm
            onCreated={(group) => {
              onCreated?.(group);
            }}
          />
        </div>
      </div>
    </div>,
    portalTarget,
  );
}

export default CreateGroupModal;
