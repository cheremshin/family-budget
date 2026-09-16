export type ReceiptsLockView = { message: string } | null;

export type ReceiptRow = {
    id: string;
    amount: string;
    receivedAt: string;
    isSelected: boolean;
};

export type ReceiptsView =
    | { status: 'loading' }
    | { status: 'hidden' }
    | {
          status: 'ready';
          rows: ReceiptRow[];
          isPlanMode: boolean;
          lock: ReceiptsLockView;
      };
