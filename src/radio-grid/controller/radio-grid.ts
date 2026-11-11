import type { Value, ValueController } from '@tweakpane/core'
import { bindValue, PlainView, ValueMap, ViewProps } from '@tweakpane/core'
import type { RadioPropsObject } from '../view/radio'
import { RadioController } from './radio'

type CellConfig<T> = {
	title: string
	value: T
}

type Config<T> = {
	cellConfig: (x: number, y: number) => CellConfig<T>
	groupName: string
	size: [number, number]
	value: Value<T>
	// The blade or binding's view props, so the cells follow its disabled state
	viewProps?: ViewProps
}

export class RadioGridController<T> implements ValueController<T, PlainView> {
	public readonly size: [number, number]
	public readonly value: Value<T>
	public readonly view: PlainView
	public readonly viewProps: ViewProps
	public get cellControllers(): RadioController[] {
		return this.cellCs_
	}
	private readonly cellCs_: RadioController[] = []

	private readonly cellValues_: T[] = []

	constructor(doc: Document, config: Config<T>) {
		this.size = config.size
		this.value = config.value
		this.viewProps = config.viewProps ?? ViewProps.create()

		const [w, h] = this.size
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const cellConfig = config.cellConfig(x, y)
				const bc = new RadioController(doc, {
					name: config.groupName,
					props: ValueMap.fromObject<RadioPropsObject>({
						...cellConfig,
					}),
					viewProps: ViewProps.create({ parent: this.viewProps }),
				})
				bc.view.inputElement.addEventListener('change', () => {
					this.value.rawValue = cellConfig.value
				})
				this.cellCs_.push(bc)
				this.cellValues_.push(cellConfig.value)
			}
		}

		bindValue(this.value, (value) => {
			const cc = this.findCellByValue(value)
			if (!cc) {
				return
			}

			cc.view.inputElement.checked = true
		})

		this.view = new PlainView(doc, {
			viewName: 'radgrid',
			viewProps: this.viewProps,
		})
		this.view.element.style.gridTemplateColumns = `repeat(${w}, 1fr)`

		for (const bc of this.cellCs_) {
			this.view.element.append(bc.view.element)
		}
	}

	public findCellByValue(value: T): null | RadioController {
		return this.cellCs_.find((_, index) => this.cellValues_[index] === value) ?? null
	}
}
