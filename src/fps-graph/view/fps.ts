import type { View, ViewProps } from '@tweakpane/core'
import { ClassName } from '@tweakpane/core'

type Config = {
	viewProps: ViewProps
}

const className = ClassName('fps')

export class FpsView implements View {
	public readonly element: HTMLElement
	public readonly graphElement: HTMLElement
	public readonly valueElement: HTMLElement

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)

		this.graphElement = doc.createElement('div')
		this.graphElement.classList.add(className('g'))
		this.element.append(this.graphElement)

		const labelElement = doc.createElement('div')
		labelElement.classList.add(className('l'))
		this.element.append(labelElement)

		const valueElement = doc.createElement('span')
		valueElement.classList.add(className('v'))
		valueElement.textContent = '--'
		labelElement.append(valueElement)
		this.valueElement = valueElement

		const unitElement = doc.createElement('span')
		unitElement.classList.add(className('u'))
		unitElement.textContent = 'FPS'
		labelElement.append(unitElement)
	}
}
