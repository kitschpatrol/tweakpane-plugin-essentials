import type { Controller, NumberTextProps, Value, ViewProps } from '@tweakpane/core'
import { parseNumber, PointNdTextController, RangeConstraint } from '@tweakpane/core'
import type { CubicBezier } from '../model/cubic-bezier'
import { CubicBezierAssembly } from '../model/cubic-bezier'
import { CubicBezierPickerView } from '../view/cubic-bezier-picker'
import { CubicBezierGraphController } from './cubic-bezier-graph'

type Axis = {
	textProps: NumberTextProps
}

type Config = {
	axis: Axis
	value: Value<CubicBezier>
	viewProps: ViewProps
}

export class CubicBezierPickerController implements Controller<CubicBezierPickerView> {
	public readonly value: Value<CubicBezier>
	public readonly view: CubicBezierPickerView
	public readonly viewProps: ViewProps
	get allFocusableElements(): HTMLElement[] {
		return [this.gc_.view.element, ...this.tc_.view.textViews.map((v) => v.inputElement)]
	}
	private readonly gc_: CubicBezierGraphController

	private readonly tc_: PointNdTextController<CubicBezier>

	constructor(doc: Document, config: Config) {
		this.value = config.value
		this.viewProps = config.viewProps

		this.view = new CubicBezierPickerView(doc, {
			viewProps: this.viewProps,
		})

		this.gc_ = new CubicBezierGraphController(doc, {
			keyScale: config.axis.textProps.value('keyScale'),
			value: this.value,
			viewProps: this.viewProps,
		})
		this.view.graphElement.append(this.gc_.view.element)

		const xAxis = {
			...config.axis,
			constraint: new RangeConstraint({ min: 0, max: 1 }),
		}
		const yAxis = {
			...config.axis,
			constraint: undefined,
		}
		this.tc_ = new PointNdTextController(doc, {
			assembly: CubicBezierAssembly,
			axes: [xAxis, yAxis, xAxis, yAxis],
			parser: parseNumber,
			value: this.value,
			viewProps: this.viewProps,
		})
		this.view.textElement.append(this.tc_.view.element)
	}

	public refresh(): void {
		this.gc_.refresh()
	}
}
