export const PlusIcon = ({ className = 'h-4 w-4', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M10 4v12M4 10h12" />
  </svg>
);

export const CloseIcon = ({ className = 'h-4 w-4', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M6 6l8 8M14 6l-8 8" />
  </svg>
);

export const ClockIcon = ({ className = 'h-5 w-5', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6.2v4l2.6 1.8" />
  </svg>
);

export const BellIcon = ({ className = 'h-5 w-5', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M15 12V9a5 5 0 10-10 0v3l-1 2h12l-1-2z" />
    <path d="M8 15a2 2 0 004 0" />
  </svg>
);

export const DashboardIcon = ({ className = 'h-5 w-5', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="3.6" y="3.6" width="5.8" height="5.8" rx="1.4" />
    <rect x="10.8" y="3.6" width="5.6" height="3.6" rx="1.2" />
    <rect x="10.8" y="8" width="5.6" height="8.4" rx="1.2" />
    <rect x="3.6" y="10.6" width="5.8" height="5.8" rx="1.4" />
  </svg>
);

export const GroupIcon = ({ className = 'h-5 w-5', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M7 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path d="M13.5 10.5a2 2 0 100-4 2 2 0 000 4z" />
    <path d="M3.5 15c0-1.7 1.9-3 3.5-3s3.5 1.3 3.5 3v1.5H3.5V15z" />
    <path d="M11 15c0-.9.7-1.6 1.6-1.8l.9-.2c1.3-.3 2.5.7 2.5 2v1.5H11V15z" />
  </svg>
);

export const WalletIcon = ({ className = 'h-5 w-5', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="3.5" y="5.5" width="13" height="9" rx="2" />
    <path d="M12.5 10h3" />
    <circle cx="12" cy="10" r="1" />
  </svg>
);

export const ActivityIcon = ({ className = 'h-5 w-5', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M3.5 10.5h3l2-5 3 9 2-4h3" />
    <circle cx="3.5" cy="10.5" r="1" />
    <circle cx="14.5" cy="10.5" r="1" />
    <circle cx="16.5" cy="10.5" r="1" />
  </svg>
);

export const SettingsIcon = ({ className = 'h-5 w-5', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M10 7.2a2.8 2.8 0 110 5.6 2.8 2.8 0 010-5.6z" />
    <path d="M3.8 11.2l-.6-2.4 1.8-.8a5.2 5.2 0 011-1.8l-.6-1.9L7 3l.9 1.7c.6-.1 1.2-.1 1.8 0L10.6 3l2.6.5-.6 1.9c.4.5.7 1.1 1 1.8l1.8.8-.6 2.4-1.9-.2c-.3.4-.6.8-1 1.1l.1 2-2.4.8-.9-1.8c-.6.1-1.2.1-1.8 0l-.9 1.8-2.4-.8.2-2c-.4-.3-.7-.7-1-1.1l-1.9.2z" />
  </svg>
);
