import type { BindingTarget } from '@tweakpane/core'
import { Interval } from '../model/interval'

/**
 * Reads a bound `{ min, max }` object as an interval, or `[0, 0]` when the
 * value is not one.
 */
export function intervalFromUnknown(value: unknown): Interval {
	return Interval.isObject(value) ? new Interval(value.min, value.max) : new Interval(0, 0)
}

/**
 * Writes an interval back to the bound `{ min, max }` object.
 */
export function writeInterval(target: BindingTarget, value: Interval): void {
	target.writeProperty('max', value.max)
	target.writeProperty('min', value.min)
}
