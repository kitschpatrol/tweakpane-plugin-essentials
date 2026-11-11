import type { Foldable, PickerLayout, View, ViewProps } from '@tweakpane/core'
import { bindValueMap, ClassName, SVG_NS, valueToClassName } from '@tweakpane/core'

type Config = {
	foldable: Foldable
	pickerLayout: PickerLayout
	viewProps: ViewProps
}

const className = ClassName('cbz')

export class CubicBezierView implements View {
	public readonly buttonElement: HTMLButtonElement
	public readonly element: HTMLElement
	public readonly pickerElement: HTMLElement | null
	public readonly textElement: HTMLElement

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)
		config.foldable.bindExpandedClass(this.element, className(undefined, 'expanded'))
		bindValueMap(
			config.foldable,
			'completed',
			valueToClassName(this.element, className(undefined, 'cpl')),
		)

		const headElement = doc.createElement('div')
		headElement.classList.add(className('h'))
		this.element.append(headElement)

		const buttonElement = doc.createElement('button')
		buttonElement.classList.add(className('b'))
		config.viewProps.bindDisabled(buttonElement)
		const iconElement = doc.createElementNS(SVG_NS, 'svg')
		iconElement.innerHTML = '<path d="M2 13C8 13 8 3 14 3"/>'
		buttonElement.append(iconElement)
		headElement.append(buttonElement)
		this.buttonElement = buttonElement

		const textElement = doc.createElement('div')
		textElement.classList.add(className('t'))
		headElement.append(textElement)
		this.textElement = textElement

		if (config.pickerLayout === 'inline') {
			const pickerElement = doc.createElement('div')
			pickerElement.classList.add(className('p'))
			this.element.append(pickerElement)
			this.pickerElement = pickerElement
		} else {
			this.pickerElement = null
		}
	}
}
