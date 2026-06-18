import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    transpilePackages: ['@family-budget/ui', '@family-budget/database'],
};

export default nextConfig;
