import type { NextConfig } from 'next';

import path from 'path';

const securityHeaders = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
    turbopack: {
        root: path.resolve(__dirname, '../..'),
    },
    transpilePackages: ['@family-budget/domain', '@family-budget/ui', '@family-budget/database'],
    typedRoutes: true,
    output: 'standalone',
    outputFileTracingRoot: path.resolve(__dirname, '../..'),
    poweredByHeader: false,
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders }];
    },
};

export default nextConfig;
