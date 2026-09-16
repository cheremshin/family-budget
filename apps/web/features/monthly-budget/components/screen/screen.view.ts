export type ScreenView =
    | { status: 'loading' }
    | { status: 'error'; message: string; canRetry: boolean }
    | { status: 'not-started'; isPast: boolean; isCreating: boolean; error: string | null }
    | { status: 'ready'; syncError: string | null };
