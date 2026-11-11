import type { Blade, LabelProps, LabelView } from '@tweakpane/core'
import { BladeController, LabelController } from '@tweakpane/core'
import type { ButtonGridController } from './button-grid'

type Config = {
	blade: Blade
	labelProps: LabelProps
	valueController: ButtonGridController
}

export class ButtonGridBladeController extends BladeController<LabelView> {
	public readonly labelController: LabelController<ButtonGridController>
	public readonly valueController: ButtonGridController

	constructor(doc: Document, config: Config) {
		const bc = config.valueController
		const lc = new LabelController(doc, {
			blade: config.blade,
			props: config.labelProps,
			valueController: bc,
		})
		super({
			blade: config.blade,
			view: lc.view,
			viewProps: bc.viewProps,
		})

		this.valueController = bc
		this.labelController = lc
	}
}
