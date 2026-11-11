import { TpChangeEvent } from '@tweakpane/core'
import type { RadioCellApi } from './radio-cell-api'

export class TpRadioGridChangeEvent<T> extends TpChangeEvent<T> {
	public readonly cell: RadioCellApi
	public readonly index: [number, number]

	constructor(
		target: unknown,
		cell: RadioCellApi,
		index: [number, number],
		value: T,
		last?: boolean,
	) {
		super(target, value, last)

		this.cell = cell
		this.index = index
	}
}
