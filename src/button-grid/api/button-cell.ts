import type { ButtonController } from '@tweakpane/core'
import { TpEvent } from '@tweakpane/core'

type ButtonCellApiEvents = {
	click: {
		event: TpEvent
	}
}

export class ButtonCellApi {
	get disabled(): boolean {
		return this.controller_.viewProps.get('disabled')
	}

	set disabled(disabled: boolean) {
		this.controller_.viewProps.set('disabled', disabled)
	}

	get title(): string {
		return this.controller_.props.get('title') ?? ''
	}

	set title(title: string) {
		this.controller_.props.set('title', title)
	}

	private readonly controller_: ButtonController

	constructor(controller: ButtonController) {
		this.controller_ = controller
	}

	public on<EventName extends keyof ButtonCellApiEvents>(
		eventName: EventName,
		handler: (event: ButtonCellApiEvents[EventName]['event']) => void,
	): this {
		const bh = handler.bind(this)
		const { emitter } = this.controller_
		emitter.on(eventName, () => {
			bh(new TpEvent(this))
		})
		return this
	}
}
