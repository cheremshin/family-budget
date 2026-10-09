import { getCurrentPeriod } from "@/lib/clock";
import { PERIOD_PARAM, resolvePeriodParam, toPeriodParam } from "@family-budget/domain/shared";
import { NextResponse, type NextRequest } from "next/server";

export function incomesProxy(request: NextRequest): NextResponse {
    const url = request.nextUrl;
    const raw = url.searchParams.getAll(PERIOD_PARAM);
    const canonical = toPeriodParam(resolvePeriodParam(raw, getCurrentPeriod()));

    if (raw.length === 1 && raw[0] === canonical) {
        return NextResponse.next();
    }

    const target = url.clone();
    target.searchParams.set(PERIOD_PARAM, canonical);
    return NextResponse.redirect(target);
}
