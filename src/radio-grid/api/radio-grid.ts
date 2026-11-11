import type { LabeledValueBladeController, Value } from '@tweakpane/core'
import { BladeApi } from '@tweakpane/core'
import type { RadioController } from '../controller/radio'
import type { RadioGridController } from '../controller/radio-grid'
import { RadioCellApi } from './radio-cell-api'
import { TpRadioGridChangeEvent } from './tp-radio-grid-event'

type RadioGridApiEvents<T> = {
	change: {
		event: TpRadioGridChangeEvent<T>
	}
}

export class RadioGridApi<T> extends BladeApi<
	LabeledValueBladeController<T, RadioGridController<T>>
> {
	get value(): Value<T> {
		return this.controller.value
	}

	private readonly cellToApiMap_ = new Map<RadioController, RadioCellApi>()

	constructor(controller: LabeledValueBladeController<T, RadioGridController<T>>) {
		super(controller)

		const gc = this.controller.valueController
		for (const cc of gc.cellControllers) {
			const api = new RadioCellApi(cc)
			this.cellToApiMap_.set(cc, api)
		}
	}

	public cell(x: number, y: number): RadioCellApi | undefined {
		const gc = this.controller.valueController
		const cc = gc.cellControllers[y * gc.size[0] + x]
		return cc ? this.cellToApiMap_.get(cc) : undefined
	}

	public on<EventName extends keyof RadioGridApiEvents<T>>(
		eventName: EventName,
		handler: (event: RadioGridApiEvents<T>[EventName]['event']) => void,
	): void {
		const bh = handler.bind(this)
		this.controller.value.emitter.on(eventName, (event) => {
			const gc = this.controller.valueController
			const cc = gc.findCellByValue(event.rawValue)
			if (!cc) {
				return
			}

			const capi = this.cellToApiMap_.get(cc)
			if (!capi) {
				return
			}

			const i = gc.cellControllers.indexOf(cc)
			bh(
				new TpRadioGridChangeEvent(
					this,
					capi,
					[i % gc.size[0], Math.floor(i / gc.size[0])],
					event.rawValue,
				),
			)
		})
	}
}
