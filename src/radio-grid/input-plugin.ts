import type { BaseInputParams, InputBindingPlugin, MicroParser } from '@tweakpane/core'
import {
	boolFromUnknown,
	createPlugin,
	numberFromUnknown,
	parseRecord,
	stringFromUnknown,
	writePrimitive,
} from '@tweakpane/core'
import { RadioGridController } from './controller/radio-grid'

export type RadioGridInputParams<T> = {
	cells: (
		x: number,
		y: number,
	) => {
		title: string
		value: T
	}
	groupName: string
	size: [number, number]
	view: 'radiogrid'
} & BaseInputParams

function createRadioGridInputPlugin<T>(config: {
	binding: InputBindingPlugin<T, T, RadioGridInputParams<T>>['binding']
	isType: (value: unknown) => value is T
}): InputBindingPlugin<T, T, RadioGridInputParams<T>> {
	return createPlugin({
		accept(value, params) {
			if (!config.isType(value)) {
				return null
			}

			const result = parseRecord<RadioGridInputParams<T>>(params, (p) => ({
				cells: p.required.function as MicroParser<
					(
						x: number,
						y: number,
					) => {
						title: string
						value: T
					}
				>,
				groupName: p.required.string,
				size: p.required.array(p.required.number) as MicroParser<[number, number]>,
				view: p.required.constant('radiogrid'),
			}))
			return result
				? {
						initialValue: value,
						params: result,
					}
				: null
		},
		binding: config.binding,
		controller(args) {
			return new RadioGridController(args.document, {
				cellConfig: args.params.cells,
				groupName: args.params.groupName,
				size: args.params.size,
				value: args.value,
			})
		},
		id: 'input-radiogrid',
		type: 'input',
	})
}

export const RadioGridNumberInputPlugin = createRadioGridInputPlugin<number>({
	binding: {
		reader: (_args) => numberFromUnknown,
		writer: (_args) => writePrimitive,
	},
	isType(value: unknown): value is number {
		return typeof value === 'number'
	},
})

export const RadioGridStringInputPlugin = createRadioGridInputPlugin<string>({
	binding: {
		reader: (_args) => stringFromUnknown,
		writer: (_args) => writePrimitive,
	},
	isType(value: unknown): value is string {
		return typeof value === 'string'
	},
})

export const RadioGridBooleanInputPlugin = createRadioGridInputPlugin<boolean>({
	binding: {
		reader: (_args) => boolFromUnknown,
		writer: (_args) => writePrimitive,
	},
	isType(value: unknown): value is boolean {
		return typeof value === 'boolean'
	},
})
