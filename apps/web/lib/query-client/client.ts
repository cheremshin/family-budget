import { environmentManager, hashKey } from '@tanstack/query-core';
import { QueryClient } from 'mobx-tanstack-query';

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                throwOnError: false,
                queryKeyHashFn: hashKey,
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                staleTime: 10 * 60 * 1000,
            },
            mutations: {
                throwOnError: true,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
    if (environmentManager.isServer()) return createQueryClient();

    return (browserQueryClient ??= createQueryClient());
}
