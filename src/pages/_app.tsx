import "../index.css";
import "../App.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname.startsWith("/auth");
  const isRootPage = router.pathname === "/";

  return (
    <AuthProvider>
      {isAuthPage || isRootPage ? (
        <>
          <Head>
            <title>MAWS - 갤러리 실무 자동화 시스템</title>
            <link rel="icon" type="image/png" href="/favicon.png" />
            <link rel="shortcut icon" type="image/png" href="/favicon.png" />
            <link rel="apple-touch-icon" href="/logo.png" />
          </Head>
          <Component {...pageProps} />
        </>
      ) : (
        <>
          <Head>
            <title>MAWS</title>
            <link rel="icon" type="image/png" href="/favicon.png" />
            <link rel="shortcut icon" type="image/png" href="/favicon.png" />
            <link rel="apple-touch-icon" href="/logo.png" />
          </Head>
          <DashboardLayout>
            <Component {...pageProps} />
          </DashboardLayout>
        </>
      )}
    </AuthProvider>
  );
}
