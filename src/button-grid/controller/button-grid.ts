import type { ButtonPropsObject, Controller } from '@tweakpane/core'
import { ButtonController, PlainView, ValueMap, ViewProps } from '@tweakpane/core'

type CellConfig = {
	title: string
}

type Config = {
	cellConfig: (x: number, y: number) => CellConfig
	size: [number, number]
	// The blade's view props, so the cells follow its disabled state
	viewProps?: ViewProps
}
export type ButtonGridControllerConfig = Config

export class ButtonGridController implements Controller<PlainView> {
	public readonly size: [number, number]
	public readonly view: PlainView
	public readonly viewProps: ViewProps
	get cellControllers(): ButtonController[] {
		return this.cellCs_
	}

	private readonly cellCs_: ButtonController[]

	constructor(doc: Document, config: Config) {
		this.size = config.size
		this.viewProps = config.viewProps ?? ViewProps.create()

		const [w, h] = this.size
		const bcs = []
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const bc = new ButtonController(doc, {
					props: ValueMap.fromObject<ButtonPropsObject>({
						...config.cellConfig(x, y),
					}),
					viewProps: ViewProps.create({ parent: this.viewProps }),
				})
				bcs.push(bc)
			}
		}

		this.cellCs_ = bcs

		this.viewProps.handleDispose(() => {
			for (const c of this.cellCs_) {
				c.viewProps.set('disposed', true)
			}
		})

		this.view = new PlainView(doc, {
			viewName: 'btngrid',
			viewProps: this.viewProps,
		})
		this.view.element.style.gridTemplateColumns = `repeat(${w}, 1fr)`

		for (const bc of this.cellCs_) {
			this.view.element.append(bc.view.element)
		}
	}
}
