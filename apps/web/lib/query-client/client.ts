import { hashKey } from '@tanstack/query-core';
import { QueryClient } from 'mobx-tanstack-query';

export const queryClient = new QueryClient({
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
