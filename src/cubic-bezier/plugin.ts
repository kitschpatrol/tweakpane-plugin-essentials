import type { BladePlugin, Constraint, LabelPropsObject, PickerLayout } from '@tweakpane/core'
import type { BaseBladeParams } from 'tweakpane'
import {
	createNumberFormatter,
	createPlugin,
	createValue,
	LabeledValueBladeController,
	parseRecord,
	PointNdConstraint,
	RangeConstraint,
	ValueMap,
} from '@tweakpane/core'
import { CubicBezierApi } from './api/cubic-bezier'
import { CubicBezierController } from './controller/cubic-bezier'
import { CubicBezier, CubicBezierAssembly } from './model/cubic-bezier'

export type CubicBezierBladeParams = BaseBladeParams & {
	expanded?: boolean
	label?: string
	picker?: PickerLayout
	value: [number, number, number, number]
	view: 'cubicbezier'
}

function createConstraint(): Constraint<CubicBezier> {
	return new PointNdConstraint<CubicBezier>({
		assembly: CubicBezierAssembly,
		components: [0, 1, 2, 3].map((index) =>
			index % 2 === 0
				? new RangeConstraint({
						min: 0,
						max: 1,
					})
				: undefined,
		),
	})
}

function isCubicBezierBladeController(
	controller: unknown,
): controller is LabeledValueBladeController<CubicBezier, CubicBezierController> {
	return (
		controller instanceof LabeledValueBladeController &&
		controller.valueController instanceof CubicBezierController
	)
}

export const CubicBezierBladePlugin: BladePlugin<CubicBezierBladeParams> = createPlugin({
	accept(params) {
		const result = parseRecord(params, (p) => ({
			expanded: p.optional.boolean,
			label: p.optional.string,
			picker: p.optional.custom<PickerLayout>((v) =>
				v === 'inline' || v === 'popup' ? v : undefined,
			),
			value: p.required.array(p.required.number),
			view: p.required.constant('cubicbezier'),
		}))
		return result ? { params: result } : null
	},
	api(args) {
		return isCubicBezierBladeController(args.controller)
			? new CubicBezierApi(args.controller)
			: null
	},
	controller(args) {
		const rv = new CubicBezier(...args.params.value)
		const v = createValue(rv, {
			constraint: createConstraint(),
			equals: CubicBezier.equals,
		})
		const vc = new CubicBezierController(args.document, {
			axis: {
				textProps: ValueMap.fromObject({
					formatter: createNumberFormatter(2),
					keyScale: 0.1,
					pointerScale: 0.01,
				}),
			},
			expanded: args.params.expanded ?? false,
			pickerLayout: args.params.picker ?? 'popup',
			value: v,
			viewProps: args.viewProps,
		})
		return new LabeledValueBladeController(args.document, {
			blade: args.blade,
			props: ValueMap.fromObject<LabelPropsObject>({
				label: args.params.label,
			}),
			value: v,
			valueController: vc,
		})
	},
	id: 'cubicbezier',
	type: 'blade',
})
