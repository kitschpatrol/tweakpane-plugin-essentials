import type { PointNdAssembly } from '@tweakpane/core'
import { constrainRange, mapRange } from '@tweakpane/core'

export type CubicBezierObject = [number, number, number, number]

function interpolate(x1: number, x2: number, t: number): number {
	return x1 * (1 - t) + x2 * t
}

const MAX_ITERATION = 20
const X_DELTA = 0.001
const CACHE_RESOLUTION = 100

function yForX(bezier: CubicBezier, x: number): number {
	let dt = 0.25
	let t = 0.5
	let y = -1
	for (let i = 0; i < MAX_ITERATION; i++) {
		const [tx, ty] = bezier.curve(t)
		t += dt * (tx < x ? 1 : -1)

		y = ty
		dt *= 0.5

		if (Math.abs(x - tx) < X_DELTA) {
			break
		}
	}

	return y
}

export class CubicBezier {
	get x1(): number {
		return this.comps_[0]
	}
	get x2(): number {
		return this.comps_[2]
	}

	get y1(): number {
		return this.comps_[1]
	}

	get y2(): number {
		return this.comps_[3]
	}

	private cache_: number[] = []

	private readonly comps_: CubicBezierObject

	constructor(x1 = 0, y1 = 0, x2 = 1, y2 = 1) {
		this.comps_ = [x1, y1, x2, y2]
	}

	public static equals(v1: CubicBezier, v2: CubicBezier): boolean {
		return v1.x1 === v2.x1 && v1.y1 === v2.y1 && v1.x2 === v2.x2 && v1.y2 === v2.y2
	}

	public static isObject(object: unknown): object is CubicBezierObject {
		return (
			Array.isArray(object) &&
			typeof object[0] === 'number' &&
			typeof object[1] === 'number' &&
			typeof object[2] === 'number' &&
			typeof object[3] === 'number'
		)
	}

	public curve(t: number): [number, number] {
		const x01 = interpolate(0, this.x1, t)
		const y01 = interpolate(0, this.y1, t)
		const x12 = interpolate(this.x1, this.x2, t)
		const y12 = interpolate(this.y1, this.y2, t)
		const x23 = interpolate(this.x2, 1, t)
		const y23 = interpolate(this.y2, 1, t)
		const xr0 = interpolate(x01, x12, t)
		const yr0 = interpolate(y01, y12, t)
		const xr1 = interpolate(x12, x23, t)
		const yr1 = interpolate(y12, y23, t)
		return [interpolate(xr0, xr1, t), interpolate(yr0, yr1, t)]
	}

	public toObject(): CubicBezierObject {
		return [this.comps_[0], this.comps_[1], this.comps_[2], this.comps_[3]]
	}

	public y(x: number): number {
		if (this.cache_.length === 0) {
			const cache = []
			for (let i = 0; i < CACHE_RESOLUTION; i++) {
				cache.push(yForX(this, mapRange(i, 0, CACHE_RESOLUTION - 1, 0, 1)))
			}

			this.cache_ = cache
		}

		const index = Math.round(mapRange(constrainRange(x, 0, 1), 0, 1, 0, CACHE_RESOLUTION - 1))
		// Only NaN input misses the cache.
		return this.cache_[index] ?? NaN
	}
}

export const CubicBezierAssembly: PointNdAssembly<CubicBezier> = {
	fromComponents: (comps: number[]) => new CubicBezier(...comps),
	toComponents: (p: CubicBezier) => p.toObject(),
}
