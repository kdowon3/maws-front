/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        unoptimized: true,
    },
    transpilePackages: ['lucide-react'],
    webpack: (config, { isServer }) => {
        // lucide-react 모듈 최적화 문제 해결
        config.resolve.alias = {
            ...config.resolve.alias,
        };

        // barrel exports 최적화 비활성화
        config.optimizePackageImports = config.optimizePackageImports || [];
        if (!config.optimizePackageImports.includes('lucide-react')) {
            config.optimizePackageImports.push('lucide-react');
        }

        return config;
    },
    async headers() {
        return [
            {
                source: '/logo.png',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                ],
            },
            {
                source: '/favicon.png',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
