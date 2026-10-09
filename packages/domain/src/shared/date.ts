import z from 'zod';

/** Календарная дата без времени */
export const isoDateSchema = z.iso.date();
export type IsoDate = z.infer<typeof isoDateSchema>;

export const periodSchema = isoDateSchema.refine(
    (v) => v.endsWith('-01'),
    'Период должен указывать на первое число месяца',
);
export type Period = z.infer<typeof periodSchema>;

export function toIsoDate(date: Date): IsoDate {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function toPeriod(date: Date): Period {
    return `${toIsoDate(date).slice(0, 7)}-01`;
}

export const toStartOfYear = (period: Period): Period => `${period.slice(0, 4)}-01-01`;

export function shiftPeriod(period: Period, months: number): Period {
    const [year, month] = period.split('-').map(Number);
    return toPeriod(new Date(year, month - 1 + months, 1));
}

export const PERIOD_PARAM = 'period';

export function resolvePeriodParam(
    raw: string | string[] | null | undefined,
    today: Period,
): Period {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || !/^\d{4}-\d{2}/.test(value)) return today;
    const parsed = periodSchema.safeParse(`${value}-01`);
    return parsed.success ? parsed.data : today;
}

export const toPeriodParam = (period: Period): string => period.slice(0, 7);
