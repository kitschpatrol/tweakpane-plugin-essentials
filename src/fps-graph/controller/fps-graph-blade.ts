import type { Blade, LabelProps, LabelView } from '@tweakpane/core'
import { BladeController, LabelController } from '@tweakpane/core'
import type { FpsGraphController } from './fps-graph'

type Config = {
	blade: Blade
	labelProps: LabelProps
	valueController: FpsGraphController
}

export class FpsGraphBladeController extends BladeController<LabelView> {
	public readonly labelController: LabelController<FpsGraphController>
	public readonly valueController: FpsGraphController

	constructor(doc: Document, config: Config) {
		const fc = config.valueController
		const lc = new LabelController(doc, {
			blade: config.blade,
			props: config.labelProps,
			valueController: fc,
		})

		super({
			blade: config.blade,
			view: lc.view,
			viewProps: fc.viewProps,
		})

		this.valueController = fc
		this.labelController = lc
	}
}
