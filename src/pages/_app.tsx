import '../index.css';
import '../App.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isAuthPage = router.pathname.startsWith('/auth');
    const isRootPage = router.pathname === '/';

    if (isAuthPage || isRootPage) {
        return (
            <>
                <Head>
                    <title>MAWS - 갤러리 실무 자동화 시스템</title>
                    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
                </Head>
                <Component {...pageProps} />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>MAWS</title>
                <link rel="icon" type="image/svg+xml" href="/logo.svg" />
            </Head>
            <DashboardLayout>
                <Component {...pageProps} />
            </DashboardLayout>
        </>
    );
}
