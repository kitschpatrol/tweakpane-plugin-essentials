import type { PointNdTextController, View } from '@tweakpane/core'
import { ClassName } from '@tweakpane/core'
import type { Interval } from '../model/interval'
import type { RangeSliderView } from './range-slider'

type Config = {
	sliderView: RangeSliderView
	textView: PointNdTextController<Interval>['view']
}

const className = ClassName('rsltxt')

export class RangeSliderTextView implements View {
	public readonly element: HTMLElement
	private readonly sliderView_: RangeSliderView
	private readonly textView_: PointNdTextController<Interval>['view']

	constructor(doc: Document, config: Config) {
		this.sliderView_ = config.sliderView
		this.textView_ = config.textView

		this.element = doc.createElement('div')
		this.element.classList.add(className())

		const sliderElement = doc.createElement('div')
		sliderElement.classList.add(className('s'))
		sliderElement.append(this.sliderView_.element)
		this.element.append(sliderElement)

		const textElement = doc.createElement('div')
		textElement.classList.add(className('t'))
		textElement.append(this.textView_.element)
		this.element.append(textElement)
	}
}
