import type { View, ViewProps } from '@tweakpane/core'
import { ClassName } from '@tweakpane/core'

type Config = {
	viewProps: ViewProps
}

const className = ClassName('cbzp')

export class CubicBezierPickerView implements View {
	public readonly element: HTMLElement
	public readonly graphElement: HTMLElement
	public readonly textElement: HTMLElement

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)

		const graphElement = doc.createElement('div')
		graphElement.classList.add(className('g'))
		this.element.append(graphElement)
		this.graphElement = graphElement

		const textElement = doc.createElement('div')
		textElement.classList.add(className('t'))
		this.element.append(textElement)
		this.textElement = textElement
	}
}
