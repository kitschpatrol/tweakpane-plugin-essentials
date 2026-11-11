import type { PointNdAssembly } from '@tweakpane/core'

export type IntervalObject = {
	min: number
	max: number
}

export class Interval {
	public max: number
	public min: number

	get length(): number {
		return this.max - this.min
	}

	constructor(min: number, max: number) {
		this.min = min
		this.max = max
	}

	public static equals(v1: Interval, v2: Interval): boolean {
		return v1.min === v2.min && v1.max === v2.max
	}

	public static isObject(object: unknown): object is IntervalObject {
		if (typeof object !== 'object' || object === null) {
			return false
		}

		const { min, max } = object as Record<string, unknown>
		return typeof min === 'number' && typeof max === 'number'
	}

	public toObject(): IntervalObject {
		return {
			min: this.min,
			max: this.max,
		}
	}
}

export const IntervalAssembly: PointNdAssembly<Interval> = {
	fromComponents: ([min = 0, max = 0]) => new Interval(min, max),
	toComponents: (p) => [p.min, p.max],
}
