'use client';

import { observable, runInAction, type IObservableValue } from "mobx";
import { useLayoutEffect, useState } from "react";

export function useObservableValue<T>(value: T): { get(): T } {
    const [box] = useState<IObservableValue<T>>(() => observable.box(value, { deep: false }));

    useLayoutEffect(() => {
        if (box.get() !== value) runInAction(() => box.set(value));
    }, [box, value]);

    return box;
}
