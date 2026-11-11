import type { BaseBladeParams, BladePlugin, LabelPropsObject, Ticker } from '@tweakpane/core'
import {
	Constants,
	createPlugin,
	createValue,
	initializeBuffer,
	IntervalTicker,
	ManualTicker,
	parseRecord,
	ValueMap,
} from '@tweakpane/core'
import { FpsGraphBladeApi } from './api/fps-graph'
import { FpsGraphController } from './controller/fps-graph'
import { FpsGraphBladeController } from './controller/fps-graph-blade'

export type FpsGraphBladeParams = BaseBladeParams & {
	interval?: number
	label?: string
	max?: number
	min?: number
	rows?: number
	view: 'fpsgraph'
}

function createTicker(document: Document, interval: number | undefined): Ticker {
	return interval === 0
		? new ManualTicker()
		: new IntervalTicker(document, interval ?? Constants.monitor.defaultInterval)
}

export const FpsGraphBladePlugin: BladePlugin<FpsGraphBladeParams> = createPlugin({
	accept(params) {
		const result = parseRecord<FpsGraphBladeParams>(params, (p) => ({
			interval: p.optional.number,
			label: p.optional.string,
			max: p.optional.number,
			min: p.optional.number,
			rows: p.optional.number,
			view: p.required.constant('fpsgraph'),
		}))
		return result ? { params: result } : null
	},
	api(args) {
		return args.controller instanceof FpsGraphBladeController
			? new FpsGraphBladeApi(args.controller)
			: null
	},
	controller(args) {
		const interval = args.params.interval ?? 500
		return new FpsGraphBladeController(args.document, {
			blade: args.blade,
			labelProps: ValueMap.fromObject<LabelPropsObject>({
				label: args.params.label,
			}),
			valueController: new FpsGraphController(args.document, {
				props: ValueMap.fromObject({
					min: args.params.min ?? 0,
					max: args.params.max ?? 90,
				}),
				rows: args.params.rows ?? 2,
				ticker: createTicker(args.document, interval),
				value: createValue(initializeBuffer(80)),
				viewProps: args.viewProps,
			}),
		})
	},
	id: 'fpsgraph',
	type: 'blade',
})
