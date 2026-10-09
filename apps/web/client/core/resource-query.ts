import { comparer, computed, makeObservable } from 'mobx';
import { Query, type QueryClient } from 'mobx-tanstack-query';

import type { QueryKey } from '@tanstack/query-core';

import { type ClientError, toClientError } from './client-error';

export type ResourceState<T> =
    | { kind: 'loading' }
    | { kind: 'error'; error: ClientError }
    | { kind: 'ready'; data: T; isFetching: boolean; syncError: ClientError | null };

type ResourceQueryConfig<Data, Key extends QueryKey> = {
    queryClient: QueryClient;
    queryKey: () => Key;
    fetch: (queryKey: Key, signal: AbortSignal) => Promise<Data>;
};

export abstract class ResourceQuery<Data, Key extends QueryKey = QueryKey> {
    private readonly query: Query<Data, ClientError, Data, Data, Key>;

    protected constructor({ queryClient, queryKey, fetch }: ResourceQueryConfig<Data, Key>) {
        this.query = new Query<Data, ClientError, Data, Data, Key>({
            queryClient,
            lazy: true,
            queryKey,
            queryFn: ({ queryKey: key, signal }) => fetch(key, signal),
        });

        makeObservable(this);
    }

    @computed
    get state(): ResourceState<Data> {
        const { data, error, isFetching } = this.result;
        const clientError = error ? toClientError(error) : null;

        if (data !== undefined) {
            return { kind: 'ready', data, isFetching, syncError: clientError };
        }

        if (clientError) {
            return { kind: 'error', error: clientError };
        }

        return { kind: 'loading' };
    }

    retry(): void {
        void this.query.refetch();
    }

    @computed({ equals: comparer.shallow })
    private get result() {
        const { data, error, isFetching } = this.query;
        return { data, error, isFetching };
    }
}
