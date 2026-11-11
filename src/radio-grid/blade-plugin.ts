import type { BaseBladeParams, BladePlugin, LabelPropsObject, MicroParser } from '@tweakpane/core'
import {
	createPlugin,
	createValue,
	LabeledValueBladeController,
	parseRecord,
	ValueMap,
} from '@tweakpane/core'
import { RadioGridApi } from './api/radio-grid'
import { RadioGridController } from './controller/radio-grid'

export type RadioGridBladeParams<T> = {
	cells: (
		x: number,
		y: number,
	) => {
		title: string
		value: T
	}
	groupName: string
	label?: string
	size: [number, number]
	value: T
	view: 'radiogrid'
} & BaseBladeParams

function isRadioGridBladeController<T>(
	controller: unknown,
): controller is LabeledValueBladeController<T, RadioGridController<T>> {
	return (
		controller instanceof LabeledValueBladeController &&
		controller.valueController instanceof RadioGridController
	)
}

export const RadioGridBladePlugin = (function <T>(): BladePlugin<RadioGridBladeParams<T>> {
	return createPlugin({
		accept(params) {
			const result = parseRecord<RadioGridBladeParams<T>>(params, (p) => ({
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
				label: p.optional.string,
				size: p.required.array(p.required.number) as MicroParser<[number, number]>,
				value: p.required.raw as MicroParser<T>,
				view: p.required.constant('radiogrid'),
			}))
			return result ? { params: result } : null
		},
		api(args) {
			return isRadioGridBladeController<T>(args.controller)
				? new RadioGridApi(args.controller)
				: null
		},
		controller(args) {
			const value = createValue(args.params.value)
			return new LabeledValueBladeController(args.document, {
				blade: args.blade,
				props: ValueMap.fromObject<LabelPropsObject>({
					label: args.params.label,
				}),
				value,
				valueController: new RadioGridController(args.document, {
					cellConfig: args.params.cells,
					groupName: args.params.groupName,
					size: args.params.size,
					value,
				}),
			})
		},
		id: 'radiogrid',
		type: 'blade',
	})
})()
