import type { LabeledValueBladeController } from '@tweakpane/core'
import { BladeApi, TpChangeEvent } from '@tweakpane/core'
import type { CubicBezierController } from '../controller/cubic-bezier'
import type { CubicBezier } from '../model/cubic-bezier'

export type CubicBezierApiEvents = {
	change: {
		event: TpChangeEvent<CubicBezier>
	}
}

export class CubicBezierApi extends BladeApi<
	LabeledValueBladeController<CubicBezier, CubicBezierController>
> {
	get label(): null | string | undefined {
		return this.controller.labelController.props.get('label')
	}

	set label(label: null | string | undefined) {
		this.controller.labelController.props.set('label', label)
	}

	get value(): CubicBezier {
		return this.controller.valueController.value.rawValue
	}

	set value(value: CubicBezier) {
		this.controller.valueController.value.rawValue = value
	}

	public on<EventName extends keyof CubicBezierApiEvents>(
		eventName: EventName,
		handler: (event: CubicBezierApiEvents[EventName]['event']) => void,
	): this {
		const bh = handler.bind(this)
		this.controller.valueController.value.emitter.on(eventName, (event) => {
			bh(new TpChangeEvent(this, event.rawValue, event.options.last))
		})
		return this
	}
}
