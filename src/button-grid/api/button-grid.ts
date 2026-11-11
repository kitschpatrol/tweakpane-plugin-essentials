import type { ButtonController } from '@tweakpane/core'
import { BladeApi, Emitter } from '@tweakpane/core'
import type { ButtonGridBladeController } from '../controller/button-grid-blade'
import { ButtonCellApi } from './button-cell'
import { TpButtonGridEvent } from './tp-button-grid-event'

type ButtonGridApiEvents = {
	click: {
		event: TpButtonGridEvent
	}
}

export class ButtonGridApi extends BladeApi<ButtonGridBladeController> {
	private readonly cellToApiMap_ = new Map<ButtonController, ButtonCellApi>()
	private readonly emitter_: Emitter<ButtonGridApiEvents>

	constructor(controller: ButtonGridBladeController) {
		super(controller)

		this.emitter_ = new Emitter()

		const gc = this.controller.valueController
		for (const [i, cc] of gc.cellControllers.entries()) {
			const api = new ButtonCellApi(cc)
			this.cellToApiMap_.set(cc, api)

			cc.emitter.on('click', () => {
				const x = i % gc.size[0]
				const y = Math.floor(i / gc.size[0])
				this.emitter_.emit('click', {
					event: new TpButtonGridEvent(this, api, [x, y]),
				})
			})
		}
	}

	public cell(x: number, y: number): ButtonCellApi | undefined {
		const gc = this.controller.valueController
		const cc = gc.cellControllers[y * gc.size[0] + x]
		return cc ? this.cellToApiMap_.get(cc) : undefined
	}

	public on<EventName extends keyof ButtonGridApiEvents>(
		eventName: EventName,
		handler: (event: ButtonGridApiEvents[EventName]['event']) => void,
	): this {
		const bh = handler.bind(this)
		this.emitter_.on(eventName, (event) => {
			bh(event.event)
		})
		return this
	}
}
