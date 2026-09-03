/**
 * Цвет участника в полосах распределения. Классы перечислены литералами: Tailwind
 * сканирует исходники и не увидит имя, собранное из шаблонной строки.
 */
const CHART_BACKGROUNDS = [
    'bg-chart-2',
    'bg-chart-4',
    'bg-chart-1',
    'bg-chart-3',
    'bg-chart-5',
] as const;

export function chartBackground(colorIndex: number): string {
    return CHART_BACKGROUNDS[colorIndex % CHART_BACKGROUNDS.length];
}
