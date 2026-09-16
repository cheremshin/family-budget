export type PlanLock = 'closed' | 'foreign';

/** Если null - можно редактировать, иначе причина почему */
export type PlanLockView = {
    reason: PlanLock;
    message: string;
} | null;

export type PlannedIncomeSummary = {
    plannedAmount: string;
    /** Необходим как дефолтное значение формы редактирования плана */
    plannedAmountValue: string;
    received: string;
    progress: number;
    progressLabel: string;
};

export type PlannedIncomeView =
    | { status: 'loading' }
    | {
          status: 'no-plan';
          memberName: string;
          lock: PlanLockView;
      }
    | {
          status: 'planned';
          summary: PlannedIncomeSummary;
          lock: PlanLockView;
      };
