import type { BaseBladeParams, BladePlugin, LabelPropsObject, MicroParser } from '@tweakpane/core'
import { createPlugin, parseRecord, ValueMap } from '@tweakpane/core'
import { ButtonGridApi } from './api/button-grid'
import { ButtonGridController } from './controller/button-grid'
import { ButtonGridBladeController } from './controller/button-grid-blade'

export type ButtonGridBladeParams = {
	cells: (x: number, y: number) => { title: string }
	label?: string
	size: [number, number]
	view: 'buttongrid'
} & BaseBladeParams

export const ButtonGridBladePlugin: BladePlugin<ButtonGridBladeParams> = createPlugin({
	accept(params) {
		const result = parseRecord<ButtonGridBladeParams>(params, (p) => ({
			cells: p.required.function as MicroParser<(x: number, y: number) => { title: string }>,
			label: p.optional.string,
			size: p.required.array(p.required.number) as MicroParser<[number, number]>,
			view: p.required.constant('buttongrid'),
		}))
		return result ? { params: result } : null
	},
	api(args) {
		return args.controller instanceof ButtonGridBladeController
			? new ButtonGridApi(args.controller)
			: null
	},
	controller(args) {
		return new ButtonGridBladeController(args.document, {
			blade: args.blade,
			labelProps: ValueMap.fromObject<LabelPropsObject>({
				label: args.params.label,
			}),
			valueController: new ButtonGridController(args.document, {
				cellConfig: args.params.cells,
				size: args.params.size,
			}),
		})
	},
	id: 'buttongrid',
	type: 'blade',
})
