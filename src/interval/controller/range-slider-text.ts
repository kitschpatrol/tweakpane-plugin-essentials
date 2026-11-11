import type {
	Constraint,
	NumberTextProps,
	Parser,
	SliderProps,
	Value,
	ValueController,
	ViewProps,
} from '@tweakpane/core'
import { PointNdTextController } from '@tweakpane/core'
import type { Interval } from '../model/interval'
import { IntervalAssembly } from '../model/interval'
import { RangeSliderTextView } from '../view/range-slider-text'
import { RangeSliderController } from './range-slider'

type Config = {
	constraint: Constraint<number> | undefined
	parser: Parser<number>
	sliderProps: SliderProps
	textProps: NumberTextProps
	value: Value<Interval>
	viewProps: ViewProps
}

export class RangeSliderTextController implements ValueController<Interval, RangeSliderTextView> {
	public readonly value: Value<Interval>
	public readonly view: RangeSliderTextView
	public readonly viewProps: ViewProps
	public get textController(): PointNdTextController<Interval> {
		return this.tc_
	}
	private readonly sc_: RangeSliderController

	private readonly tc_: PointNdTextController<Interval>

	constructor(doc: Document, config: Config) {
		this.value = config.value
		this.viewProps = config.viewProps

		this.sc_ = new RangeSliderController(doc, config)

		const axis = {
			constraint: config.constraint,
			textProps: config.textProps,
		}
		this.tc_ = new PointNdTextController(doc, {
			assembly: IntervalAssembly,
			axes: [axis, axis],
			parser: config.parser,
			value: this.value,
			viewProps: config.viewProps,
		})

		this.view = new RangeSliderTextView(doc, {
			sliderView: this.sc_.view,
			textView: this.tc_.view,
		})
	}
}
