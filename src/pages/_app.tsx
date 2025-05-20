import '../index.css';
import '../App.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isAuthPage = router.pathname.startsWith('/auth');

    if (isAuthPage) {
        return <Component {...pageProps} />;
    }

    return (
        <>
            <Head>
                <title>MAWS</title>
                <link rel="icon" type="image/svg+xml" href="/maws-logo.svg" />
            </Head>
            <DashboardLayout>
                <Component {...pageProps} />
            </DashboardLayout>
        </>
    );
}
