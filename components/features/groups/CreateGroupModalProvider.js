import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CreateGroupModal } from './CreateGroupModal';

const CreateGroupModalContext = createContext(null);

export function CreateGroupModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState(null);

  const open = useCallback((options = {}) => {
    setPendingCallback(() => options.onCreated ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPendingCallback(null);
  }, []);

  const handleCreated = useCallback(
    (group) => {
      if (typeof pendingCallback === 'function') {
        pendingCallback(group);
      }
      close();
    },
    [pendingCallback, close],
  );

  const value = useMemo(
    () => ({
      open,
      close,
      isOpen,
    }),
    [open, close, isOpen],
  );

  return (
    <CreateGroupModalContext.Provider value={value}>
      {children}
      <CreateGroupModal
        isOpen={isOpen}
        onClose={close}
        onCreated={handleCreated}
      />
    </CreateGroupModalContext.Provider>
  );
}

export function useCreateGroupModal() {
  const context = useContext(CreateGroupModalContext);
  if (!context) {
    throw new Error('useCreateGroupModal must be used within CreateGroupModalProvider');
  }
  return context;
}
