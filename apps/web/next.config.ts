import type { NextConfig } from 'next';

import path from 'path';

const nextConfig: NextConfig = {
    turbopack: {
        root: path.resolve(__dirname, '../..'),
    },
    transpilePackages: ['@family-budget/domain', '@family-budget/ui', '@family-budget/database'],
    typedRoutes: true,
};

export default nextConfig;
