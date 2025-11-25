import { useEffect } from 'react';
import { SignedIn, SignUp, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authAppearance } from '../../lib/clerkAppearance';

const commitments = [
  {
    label: 'Human-centered capital',
    detail: 'Warm metallic cues highlight the people behind every portfolio.',
  },
  {
    label: 'Signals, not noise',
    detail: 'Futuristic neon only appears when an action is required.',
  },
  {
    label: 'Guardrails baked in',
    detail: 'Accessibility ratios, predictable spacing, copper-grade focus states.',
  },
];

export default function SignUpPage() {
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
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-tech-soft blur-3xl" />
        <div className="absolute bottom-8 left-6 h-64 w-64 rounded-full bg-warm-soft blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row-reverse lg:items-stretch lg:gap-12">
        <section className="flex-1 space-y-6 lg:py-6">
          <span className="chip border-accent-tech-soft text-accent-tech">Welcome aboard</span>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.5em] text-text-muted">Kinvest</p>
            <h1 className="text-3xl font-semibold text-text-primary">Create your Kinvest identity.</h1>
            <p className="text-lg text-text-secondary">
              We blend futuristic finance with human connection. Join the collective and keep every signal grounded.
            </p>
          </div>
          <div className="space-y-4 rounded-[16px] border border-line bg-night-1/40 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Our commitments</p>
            <ul className="space-y-4">
              {commitments.map((item) => (
                <li key={item.label}>
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-sm text-text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="flex-1 lg:max-w-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Secure onboarding</p>
              <h2 className="text-2xl font-semibold text-text-primary">Sign up</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link className="text-sm text-accent-tech underline-offset-4 hover:text-accent-tech-dim" href="/sign-in">
                Already a member?
              </Link>
              <SignedIn>
                <UserButton afterSignOutUrl="/sign-in" />
              </SignedIn>
            </div>
          </div>
          <div className="rounded-[24px] border border-line/80 bg-night-1/60 p-4 backdrop-blur">
            <SignUp appearance={authAppearance} signInUrl="/sign-in" />
          </div>
        </section>
      </div>
    </main>
  );
}
