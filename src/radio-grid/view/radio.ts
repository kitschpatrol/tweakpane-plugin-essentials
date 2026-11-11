import type { ValueMap, View, ViewProps } from '@tweakpane/core'
import { bindValueMap, ClassName } from '@tweakpane/core'

export type RadioPropsObject = {
	title: string
}

export type RadioProps = ValueMap<RadioPropsObject>

type Config = {
	name: string
	props: RadioProps
	viewProps: ViewProps
}

const className = ClassName('rad')

export class RadioView implements View {
	public readonly element: HTMLElement
	public readonly inputElement: HTMLInputElement

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)

		const labelElement = doc.createElement('label')
		labelElement.classList.add(className('l'))
		this.element.append(labelElement)

		const inputElement = doc.createElement('input')
		inputElement.classList.add(className('i'))
		inputElement.name = config.name
		inputElement.type = 'radio'
		config.viewProps.bindDisabled(inputElement)
		labelElement.append(inputElement)
		this.inputElement = inputElement

		const bodyElement = doc.createElement('div')
		bodyElement.classList.add(className('b'))
		labelElement.append(bodyElement)

		const titleElement = doc.createElement('div')
		titleElement.classList.add(className('t'))
		bodyElement.append(titleElement)
		bindValueMap(config.props, 'title', (title) => {
			titleElement.textContent = title
		})
	}
}
