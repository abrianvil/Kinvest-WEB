import { useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import Head from 'next/head';
import { Space_Grotesk } from 'next/font/google';
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '../styles/globals.css';
import { useSyncUserProfile } from '../hooks/useSyncUserProfile';
import { CreateGroupModalProvider } from '../features/groups/CreateGroupModalProvider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

function UserBootstrapper() {
  useSyncUserProfile();
  return null;
}


export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Kinvest Web</title>
      </Head>
      <div className={spaceGrotesk.variable}>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={pageProps?.dehydratedState}>
            <CreateGroupModalProvider>
              <UserBootstrapper />
              <Component {...pageProps} />
            </CreateGroupModalProvider>
          </HydrationBoundary>
        </QueryClientProvider>
      </div>
    </ClerkProvider>
  );
}
