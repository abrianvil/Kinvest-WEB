import { useEffect } from 'react';
import { SignIn, SignedIn, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authAppearance } from '../../lib/clerkAppearance';

const highlights = [
  {
    title: 'Unified positions',
    description: 'View on-chain + traditional holdings in a single, neon-lit ledger.',
  },
  {
    title: 'Copper-grade security',
    description: 'Human warmth for members, hardened auth for everyone else.',
  },
  {
    title: 'Signal first',
    description: 'Insights glow when they need you — no noisy dashboards.',
  },
  {
    title: 'Global-ready',
    description: 'Localized experiences built on an accessible design language.',
  },
];

export default function SignInPage() {
  const router = useRouter();
  const redirectUrl =
    (typeof router.query.redirect_url === 'string' && router.query.redirect_url) || '/dashboard';
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace(redirectUrl);
    }
  }, [isLoaded, isSignedIn, redirectUrl, router]);

  return (
    <main className="relative overflow-hidden bg-night-0 text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-accent-tech/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-warm-soft blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 py-16 lg:flex-row lg:items-center">
        <section className="flex-1 space-y-8">
          <span className="chip border-warm-soft text-text-warm">Member access</span>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.5em] text-text-muted">Kinvest</p>
            <h1 className="text-4xl font-semibold text-text-primary">
              Authenticate into the Kinvest operator console.
            </h1>
            <p className="text-lg text-text-secondary">
              Built for futurist investors who want neon-fast insights with a human copper touch.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-2xl border border-line bg-night-1/30 p-4 backdrop-blur hover:border-accent-tech-dim hover:shadow-techGlow transition"
              >
                <p className="text-sm font-semibold text-text-primary">{highlight.title}</p>
                <p className="text-sm text-text-muted">{highlight.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Secure area</p>
              <h2 className="text-2xl font-semibold text-text-primary">Sign in</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link className="text-sm text-warm-light underline-offset-4 hover:text-warm-1" href="/sign-up">
                Need an account?
              </Link>
              <SignedIn>
                <UserButton afterSignOutUrl="/sign-in" />
              </SignedIn>
            </div>
          </div>
          <SignIn appearance={authAppearance} signUpUrl="/sign-up" />
        </section>
      </div>
    </main>
  );
}
