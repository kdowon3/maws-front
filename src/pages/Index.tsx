import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return null;
}
