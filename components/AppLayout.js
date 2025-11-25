import Link from 'next/link';
import { useRouter } from 'next/router';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { NotificationInbox } from './features/notifications';

const primaryNav = [
  { href: '/dashboard', label: 'Overview', badge: 'Live' },
  { href: '/groups', label: 'Groups', badge: 'Beta' },
  { href: '/wallets', label: 'Wallets' },
  { href: '/activity', label: 'Activity' },
  { href: '/settings', label: 'Settings' },
];

function HeaderActions({ user }) {

  return (
    <SignedIn>
      <div className="flex items-center gap-2">
        <NotificationInbox />
        <div className="flex items-center gap-2 rounded-full border border-line/80 bg-night-2/40 px-3 py-1">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">{user?.fullName ?? user?.username}</p>
            <p className="text-[11px] text-text-muted">{user?.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </SignedIn>
  );
}

export function AppLayout({ user, children }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-night-0 text-text-primary">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-line/80 bg-night-1/60 p-5 backdrop-blur lg:block lg:sticky lg:top-6 lg:self-start lg:min-h-[calc(100vh-3rem)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Workspace</p>
            <h1 className="text-2xl font-semibold text-text-primary">Kinvest</h1>
            <p className="text-sm text-text-secondary">Futuristic finance with a warm copper pulse.</p>
          </div>

          <nav className="mt-8 space-y-1">
            {primaryNav.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                    isActive
                      ? 'border-accent-tech-dim bg-night-2/80 shadow-techGlow'
                      : 'border-transparent hover:border-line hover:bg-night-2/40'
                  }`}
                >
                  <span className="text-sm font-semibold text-text-primary">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-night-0 px-2 py-0.5 text-xs text-text-muted">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-2xl border border-line/80 bg-night-0/40 p-4 text-sm text-text-secondary">
            <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Status</p>
            <p className="font-semibold text-text-primary">All systems nominal</p>
            <p className="text-text-muted">Next cycle opens in 4 days.</p>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col gap-6 pb-4">
          <header className="flex flex-col gap-4 rounded-3xl border border-line/80 bg-night-1/70 p-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:sticky lg:top-6 lg:z-10">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Welcome</p>
              <h2 className="text-3xl font-semibold text-text-primary">
                {user?.firstName ? `Hello, ${user.firstName}` : 'Hello from Kinvest'}
              </h2>
              <p className="text-sm text-text-secondary">
                Navigate your Sol, track contributions, and glow when it is your turn to receive.
              </p>
            </div>
            <HeaderActions user={user} />
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
