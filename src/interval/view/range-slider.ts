import type { SliderProps, Value, View, ViewProps } from '@tweakpane/core'
import { ClassName, constrainRange, mapRange } from '@tweakpane/core'
import type { Interval } from '../model/interval'

type Config = {
	sliderProps: SliderProps
	value: Value<Interval>
	viewProps: ViewProps
}

const className = ClassName('rsl')

export class RangeSliderView implements View {
	public readonly barElement: HTMLElement
	public readonly element: HTMLElement
	public readonly knobElements: [HTMLElement, HTMLElement]
	public readonly trackElement: HTMLElement
	private readonly sliderProps_: SliderProps
	private readonly value_: Value<Interval>

	constructor(doc: Document, config: Config) {
		this.onSliderPropsChange_ = this.onSliderPropsChange_.bind(this)
		this.onValueChange_ = this.onValueChange_.bind(this)

		this.sliderProps_ = config.sliderProps
		this.sliderProps_.emitter.on('change', this.onSliderPropsChange_)

		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)

		this.value_ = config.value
		this.value_.emitter.on('change', this.onValueChange_)

		const trackElement = doc.createElement('div')
		trackElement.classList.add(className('t'))
		this.element.append(trackElement)
		this.trackElement = trackElement

		const barElement = doc.createElement('div')
		barElement.classList.add(className('b'))
		trackElement.append(barElement)
		this.barElement = barElement

		const createKnobElement = (modifier: 'max' | 'min') => {
			const element = doc.createElement('div')
			element.classList.add(className('k'), className('k', modifier))
			trackElement.append(element)
			return element
		}

		this.knobElements = [createKnobElement('min'), createKnobElement('max')]

		this.update_()
	}

	private onSliderPropsChange_() {
		this.update_()
	}

	private onValueChange_() {
		this.update_()
	}

	private update_(): void {
		const v = this.value_.rawValue

		if (v.length === 0) {
			this.element.classList.add(className(undefined, 'zero'))
		} else {
			this.element.classList.remove(className(undefined, 'zero'))
		}

		const minX = this.valueToX_(v.min)
		const maxX = this.valueToX_(v.max)
		this.barElement.style.left = `${minX}%`
		this.barElement.style.right = `${100 - maxX}%`
		this.knobElements[0].style.left = `${minX}%`
		this.knobElements[1].style.left = `${maxX}%`
	}

	private valueToX_(value: number): number {
		const min = this.sliderProps_.get('min')
		const max = this.sliderProps_.get('max')
		return constrainRange(mapRange(value, min, max, 0, 1), 0, 1) * 100
	}
}
