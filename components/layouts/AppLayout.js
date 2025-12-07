import Link from 'next/link';
import { useRouter } from 'next/router';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { NotificationInbox } from '../../features/notifications';
import {
  ActivityIcon,
  ClockIcon,
  DashboardIcon,
  GroupIcon,
  SettingsIcon,
  WalletIcon,
} from '../icons';

const primaryNav = [
  { href: '/dashboard', label: 'Overview', badge: 'Live', icon: DashboardIcon },
  { href: '/groups', label: 'Groups', badge: 'Beta', icon: GroupIcon },
  { href: '/wallets', label: 'Wallets', icon: WalletIcon },
  { href: '/activity', label: 'Activity', icon: ActivityIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

function HeaderActions({ user }) {


  return (
    <SignedIn>
      <div className="flex items-center gap-2">
        <NotificationInbox />
        {/* <div className="flex items-center gap-2 rounded-2xl border border-line/80 bg-night-3/70 px-3 py-2"> */}
          {/* <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-text-primary">{user?.fullName ?? user?.username}</p>
            <p className="text-[11px] text-text-muted">{user?.emailAddresses?.[0]?.emailAddress}</p>
          </div> */}
          <UserButton afterSignOutUrl="/sign-in" />
        {/* </div> */}
      </div>
    </SignedIn>
  );
}

export function AppLayout({ user, children, headerTitle, headerMeta }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-night-0 text-text-primary">
      <div className="mx-auto flex max-w-6xl gap-5 px-4 py-6 lg:px-6">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-line/70 bg-night-1/60 p-5 backdrop-blur lg:block lg:sticky lg:top-6 lg:self-start lg:min-h-[calc(100vh-3rem)]">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.45em] text-text-muted">Workspace</p>
            <h1 className="text-xl font-semibold text-text-primary">Kinvest</h1>
            <p className="text-[13px] text-text-secondary">Futuristic finance with a warm copper pulse.</p>
          </div>

          <nav className="mt-7 space-y-1.5">
            {primaryNav.map((item) => {
              const isActive = router.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 transition ${
                    isActive
                      ? 'border-l-2 border-accent-tech bg-night-3 text-text-primary'
                      : 'hover:border-l-2 hover:border-line/70 hover:bg-night-3/60 text-text-secondary'
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    {Icon ? <Icon className="h-5 w-5 text-text-secondary" /> : null}
                    <span className={isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}>
                      {item.label}
                    </span>
                  </span>
                  {item.badge ? (
                    <span className="rounded-md border border-line/70 bg-night-0/70 px-2 py-0.5 text-[11px] text-text-muted">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-9 rounded-xl border border-line/70 bg-night-3/80 p-3 text-[13px] text-text-secondary">
            <p className="text-[10px] uppercase tracking-[0.45em] text-text-muted">Status</p>
            <p className="mt-1 font-semibold text-text-primary">All systems nominal</p>
            <p className="text-text-muted">Next cycle opens in 4 days.</p>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col gap-5 pt-0 pb-4">
          <header className="flex flex-col gap-2 rounded-xl border border-line/60 bg-night-3/80 px-4 py-3 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:sticky lg:top-6 lg:z-10">
            <div className="space-y-1">
              {headerTitle ? (
                <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">{headerTitle}</p>
              ) : (
                <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Welcome</p>
              )}
              <div className="flex items-center gap-2">
                <h2 className="text-[22px] font-semibold text-text-primary leading-tight">
                  {user?.firstName ? `Hello, ${user.firstName}` : 'Hello from Kinvest'}
                </h2>
                {headerMeta ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] text-text-secondary">
                    <ClockIcon className="h-4 w-4 text-text-secondary" />
                    {headerMeta}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-text-secondary">
                Navigate contributions, wallets, and rotations with clear priorities.
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
