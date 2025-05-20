import '../index.css';
import '../App.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isAuthPage = router.pathname.startsWith('/auth');

    if (isAuthPage) {
        return <Component {...pageProps} />;
    }

    return (
        <DashboardLayout>
            <Component {...pageProps} />
        </DashboardLayout>
    );
}
