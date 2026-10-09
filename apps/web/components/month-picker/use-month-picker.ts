import { useReducer } from 'react';

import { Period, shiftPeriod, toStartOfYear } from '@family-budget/domain/shared';

import { MonthPickerView, buildMonthPickerView } from './month-picker.view';

type PickerState = { isOpen: boolean; yearStart: Period };

type PickerAction =
    { type: 'open'; selected: Period } | { type: 'close' } | { type: 'shiftYear'; delta: number };

export function pickerReducer(state: PickerState, action: PickerAction): PickerState {
    switch (action.type) {
        case 'open':
            return {
                isOpen: true,
                yearStart: toStartOfYear(action.selected),
            };
        case 'close':
            return state.isOpen ? { ...state, isOpen: false } : state;
        case 'shiftYear':
            return {
                ...state,
                yearStart: shiftPeriod(state.yearStart, action.delta * 12),
            };
    }
}

export type MonthPickerActions = {
    setOpen(open: boolean): void;
    shiftYear(delta: number): void;
    select(period: Period): void;
};

type Input = {
    value: Period;
    today: Period;
    onChange(period: Period): void;
};

export function useMonthPicker({ value, today, onChange }: Input): {
    view: MonthPickerView;
    actions: MonthPickerActions;
} {
    const [state, dispatch] = useReducer(pickerReducer, value, (period): PickerState => ({
        isOpen: false,
        yearStart: toStartOfYear(period),
    }));

    const actions: MonthPickerActions = {
        setOpen: (open) => {
            dispatch(open ? { type: 'open', selected: value } : { type: 'close' });
        },
        shiftYear: (delta) => {
            dispatch({ type: 'shiftYear', delta });
        },
        select: (period) => {
            onChange(period);
            dispatch({ type: 'close' });
        },
    };

    return {
        view: buildMonthPickerView({ value, today, ...state }),
        actions,
    };
}
