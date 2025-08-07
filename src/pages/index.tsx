import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>MAWS - 갤러리 실무 자동화 시스템</title>
                <meta name="description" content="갤러리 실무 자동화 시스템" />
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">MAWS</h1>
                    <p className="text-xl text-gray-600">갤러리 실무 자동화 시스템</p>
                    <p className="mt-8 text-gray-500">랜딩 페이지 예정</p>
                </div>
            </div>
        </>
    );
};

export default Home;
