import type { RadioController } from '../controller/radio'

export class RadioCellApi {
	get disabled(): boolean {
		return this.controller_.viewProps.get('disabled')
	}

	set disabled(disabled: boolean) {
		this.controller_.viewProps.set('disabled', disabled)
	}

	get title(): string {
		return this.controller_.props.get('title')
	}

	set title(title: string) {
		this.controller_.props.set('title', title)
	}

	private readonly controller_: RadioController

	constructor(controller: RadioController) {
		this.controller_ = controller
	}
}
