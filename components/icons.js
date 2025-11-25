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
