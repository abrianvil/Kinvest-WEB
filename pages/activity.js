import Head from 'next/head';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { AppLayout } from '../components/layouts';

function ActivityPage({ user }) {
  return (
    <>
      <Head>
        <title>Activity • Kinvest</title>
      </Head>
      <AppLayout user={user}>
        <section className="space-y-4 rounded-3xl border border-line/70 bg-night-2/50 p-8 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.5em] text-text-muted">Activity Feed</p>
          <h2 className="text-3xl font-semibold text-text-primary">Audit-grade signals</h2>
          <p className="text-text-secondary">
            Soon you&apos;ll see contributions, payouts, invitations, and automated ledger adjustments streaming in real
            time with copper highlights for member-centric events.
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

export default ActivityPage;
