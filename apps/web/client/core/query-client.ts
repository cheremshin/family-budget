import { environmentManager, hashKey } from '@tanstack/query-core';
import { QueryClient } from 'mobx-tanstack-query';

import { toClientError } from './client-error';

export function createQueryClient(): QueryClient {
    const isServer = environmentManager.isServer();

    return new QueryClient({
        defaultOptions: {
            queries: {
                lazy: true,
                throwOnError: false,
                queryKeyHashFn: hashKey,
                staleTime: 60 * 1000,
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                retry: isServer
                    ? false
                    : (failureCount, error) => failureCount < 2 && toClientError(error).isRetryable,
            },
            mutations: {
                lazy: true,
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
