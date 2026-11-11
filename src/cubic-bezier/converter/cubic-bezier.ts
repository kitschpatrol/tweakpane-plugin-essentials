import { createNumberFormatter } from '@tweakpane/core'
import { CubicBezier } from '../model/cubic-bezier'

/**
 * Formats a cubic Bezier as a CSS `cubic-bezier()` function with two decimal
 * places.
 */
export function cubicBezierToString(bezier: CubicBezier): string {
	const formatter = createNumberFormatter(2)
	const comps = bezier.toObject().map((c) => formatter(c))
	return `cubic-bezier(${comps.join(', ')})`
}

const COMPS_EMPTY = [0, 0.5, 0.5, 1]

const CUBIC_BEZIER_PATTERN =
	/^cubic-bezier\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)$/u

/**
 * Parses a CSS `cubic-bezier()` function. Text that is not a valid function
 * parses as `cubic-bezier(0, 0.5, 0.5, 1)`.
 */
export function cubicBezierFromString(text: string): CubicBezier {
	const m = CUBIC_BEZIER_PATTERN.exec(text)
	if (!m) {
		return new CubicBezier(...COMPS_EMPTY)
	}

	const comps = m.slice(1).map(Number)
	return new CubicBezier(...(comps.some((comp) => Number.isNaN(comp)) ? COMPS_EMPTY : comps))
}
