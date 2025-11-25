import Head from 'next/head';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import AppLayout from '../components/AppLayout';

function SettingsPage({ user }) {
  return (
    <>
      <Head>
        <title>Settings • Kinvest</title>
      </Head>
      <AppLayout user={user}>
        <section className="rounded-3xl border border-line/80 bg-night-2/50 p-8 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Preferences</p>
          <h2 className="mt-2 text-3xl font-semibold text-text-primary">Control center</h2>
          <p className="text-text-secondary">
            Configure notification channels, locale, and ledger currencies. This page will also surface API tokens for
            partners once backend endpoints are available.
          </p>
        </section>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) {
    return {
      redirect: { destination: '/sign-in', permanent: false },
    };
  }
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const serializableUser = JSON.parse(JSON.stringify(user));
  return { props: { user: serializableUser } };
};

export default SettingsPage;
