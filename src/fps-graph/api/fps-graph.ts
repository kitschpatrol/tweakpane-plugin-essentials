import { BladeApi, TpEvent } from '@tweakpane/core'
import type { FpsGraphBladeController } from '../controller/fps-graph-blade'

export type FpsGraphBladeApiEvents = {
	tick: TpEvent<FpsGraphBladeApi>
}

export class FpsGraphBladeApi extends BladeApi<FpsGraphBladeController> {
	get fps(): null | number {
		return this.controller.valueController.fps
	}

	get max(): number {
		return this.controller.valueController.props.get('max')
	}

	set max(max: number) {
		this.controller.valueController.props.set('max', max)
	}

	get min(): number {
		return this.controller.valueController.props.get('min')
	}

	set min(min: number) {
		this.controller.valueController.props.set('min', min)
	}

	public begin(): void {
		this.controller.valueController.begin()
	}

	public end(): void {
		this.controller.valueController.end()
	}

	public on<EventName extends keyof FpsGraphBladeApiEvents>(
		eventName: EventName,
		handler: (event: FpsGraphBladeApiEvents[EventName]) => void,
	): this {
		const bh = handler.bind(this)
		const { emitter } = this.controller.valueController.ticker
		emitter.on(eventName, () => {
			bh(new TpEvent(this))
		})
		return this
	}
}
