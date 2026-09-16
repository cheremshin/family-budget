import { Mutation, QueryClient } from 'mobx-tanstack-query';

import { ClientError } from './client-error';
import { CommandResult, runCommand } from './run-command';

export interface Command<In, Out = unknown> {
    readonly isPending: boolean;
    readonly error: ClientError | null;
    run(input: In): Promise<CommandResult<Out>>;
    reset(): void;
}

type CommandConfig<In, Out> = {
    queryClient: QueryClient;
    execute: (input: In) => Promise<Out>;
    onDone?: (result: Out, input: In) => void;
};

export abstract class MutationCommand<In, Out> implements Command<In, Out> {
    private readonly mutation: Mutation<Out, In>;
    private inFlight: Promise<CommandResult<Out>> | null = null;

    protected constructor({ queryClient, execute, onDone }: CommandConfig<In, Out>) {
        this.mutation = new Mutation({
            queryClient,
            mutationFn: execute,
            onSuccess: onDone,
        });
    }

    get isPending(): boolean {
        return this.mutation.isPending;
    }

    get error(): ClientError | null {
        return this.mutation.error;
    }

    run(input: In): Promise<CommandResult<Out>> {
        // Повторный вызов во время выполнения отдает тот же результат вместо второго запроса
        return (this.inFlight ??= this.execute(input));
    }

    reset(): void {
        this.mutation.reset();
    }

    destroy(): void {
        this.mutation.destroy();
    }

    private async execute(input: In): Promise<CommandResult<Out>> {
        try {
            return await runCommand(() =>
                this.mutation.mutate(input).then(() => this.mutation.data as Out),
            );
        } finally {
            this.inFlight = null;
        }
    }
}
