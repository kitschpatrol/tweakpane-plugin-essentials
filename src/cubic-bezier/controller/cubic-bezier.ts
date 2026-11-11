import type {
	NumberTextProps,
	PickerLayout,
	Value,
	ValueController,
	ViewProps,
} from '@tweakpane/core'
import {
	bindFoldable,
	bindValue,
	connectValues,
	findNextTarget,
	Foldable,
	forceCast,
	PopupController,
	supportsTouch,
	TextController,
	ValueMap,
} from '@tweakpane/core'
import type { CubicBezier } from '../model/cubic-bezier'
import { cubicBezierFromString, cubicBezierToString } from '../converter/cubic-bezier'
import { CubicBezierView } from '../view/cubic-bezier'
import { CubicBezierPickerController } from './cubic-bezier-picker'

type Axis = {
	textProps: NumberTextProps
}

type Config = {
	axis: Axis
	expanded: boolean
	pickerLayout: PickerLayout
	value: Value<CubicBezier>
	viewProps: ViewProps
}

export class CubicBezierController implements ValueController<CubicBezier, CubicBezierView> {
	public readonly value: Value<CubicBezier>
	public readonly view: CubicBezierView
	public readonly viewProps: ViewProps
	private readonly foldable_: Foldable
	private readonly pickerC_: CubicBezierPickerController
	private readonly popC_: null | PopupController
	private readonly tc_: TextController<CubicBezier>

	constructor(doc: Document, config: Config) {
		this.onButtonBlur_ = this.onButtonBlur_.bind(this)
		this.onButtonClick_ = this.onButtonClick_.bind(this)
		this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this)
		this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this)

		this.value = config.value
		this.viewProps = config.viewProps
		this.foldable_ = Foldable.create(config.expanded)

		this.view = new CubicBezierView(doc, {
			foldable: this.foldable_,
			pickerLayout: config.pickerLayout,
			viewProps: this.viewProps,
		})
		this.view.buttonElement.addEventListener('blur', this.onButtonBlur_)
		this.view.buttonElement.addEventListener('click', this.onButtonClick_)

		this.tc_ = new TextController(doc, {
			parser: cubicBezierFromString,
			props: ValueMap.fromObject({
				formatter: cubicBezierToString,
			}),
			value: this.value,
			viewProps: this.viewProps,
		})
		this.view.textElement.append(this.tc_.view.element)

		this.popC_ =
			config.pickerLayout === 'popup'
				? new PopupController(doc, {
						viewProps: this.viewProps,
					})
				: null

		const pickerC = new CubicBezierPickerController(doc, {
			axis: config.axis,
			value: this.value,
			viewProps: this.viewProps,
		})
		for (const element of pickerC.allFocusableElements) {
			element.addEventListener('blur', this.onPopupChildBlur_)
			element.addEventListener('keydown', this.onPopupChildKeydown_)
		}

		this.pickerC_ = pickerC

		if (this.popC_) {
			this.view.element.append(this.popC_.view.element)
			this.popC_.view.element.append(this.pickerC_.view.element)
			bindValue(this.popC_.shows, (shows) => {
				if (shows) {
					pickerC.refresh()
				}
			})
			connectValues({
				backward: (_, s) => s,
				forward: (p) => p,
				primary: this.foldable_.value('expanded'),
				secondary: this.popC_.shows,
			})
		} else if (this.view.pickerElement) {
			this.view.pickerElement.append(this.pickerC_.view.element)
			bindFoldable(this.foldable_, this.view.pickerElement)
		}
	}

	private onButtonBlur_(event: FocusEvent): void {
		if (!this.popC_) {
			return
		}

		const nextTarget: HTMLElement | null = forceCast(event.relatedTarget)
		if (!nextTarget || !this.popC_.view.element.contains(nextTarget)) {
			this.popC_.shows.rawValue = false
		}
	}

	private onButtonClick_(): void {
		this.foldable_.set('expanded', !this.foldable_.get('expanded'))
		if (this.foldable_.get('expanded')) {
			this.pickerC_.allFocusableElements[0]?.focus()
		}
	}

	private onPopupChildBlur_(event: FocusEvent): void {
		if (!this.popC_) {
			return
		}

		const { element } = this.popC_.view
		const nextTarget = findNextTarget(event)
		if (nextTarget && element.contains(nextTarget)) {
			// Next target is in the popup
			return
		}

		if (
			nextTarget &&
			nextTarget === this.view.buttonElement &&
			!supportsTouch(element.ownerDocument)
		) {
			// Next target is the trigger button
			return
		}

		this.popC_.shows.rawValue = false
	}

	private onPopupChildKeydown_(event: KeyboardEvent): void {
		if (!this.popC_) {
			return
		}

		if (event.key === 'Escape') {
			this.popC_.shows.rawValue = false
		}
	}
}
