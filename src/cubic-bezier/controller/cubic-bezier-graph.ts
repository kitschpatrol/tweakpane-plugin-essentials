import type {
	PointerHandlerEvent,
	Value,
	ValueChangeOptions,
	ValueController,
	ViewProps,
} from '@tweakpane/core'
import {
	createValue,
	getHorizontalStepKeys,
	getStepForKey,
	getVerticalStepKeys,
	isArrowKey,
	PointerHandler,
} from '@tweakpane/core'
import { CubicBezier } from '../model/cubic-bezier'
import { CubicBezierGraphView } from '../view/cubic-bezier-graph'
import { CubicBezierPreviewView } from '../view/cubic-bezier-preview'

type Config = {
	keyScale: Value<number>
	value: Value<CubicBezier>
	viewProps: ViewProps
}

function getDistance(x1: number, y1: number, x2: number, y2: number): number {
	const dx = x2 - x1
	const dy = y2 - y1
	return Math.hypot(dx, dy)
}

function lockAngle(x1: number, y1: number, x2: number, y2: number): { x: number; y: number } {
	const d = getDistance(x1, y1, x2, y2)
	const a = Math.atan2(y2 - y1, x2 - x1)
	const la = (Math.round(a / (Math.PI / 4)) * Math.PI) / 4
	return {
		x: x1 + Math.cos(la) * d,
		y: y1 + Math.sin(la) * d,
	}
}

/**
 * Returns the positions of a handle's x and y in `CubicBezier.toObject()`.
 * Handle 0 is the start control point and handle 1 is the end control point.
 */
function getHandleComponentIndices(handle: number): readonly [0, 1] | readonly [2, 3] {
	return handle === 0 ? [0, 1] : [2, 3]
}

export class CubicBezierGraphController implements ValueController<
	CubicBezier,
	CubicBezierGraphView
> {
	public readonly value: Value<CubicBezier>
	public readonly view: CubicBezierGraphView
	public readonly viewProps: ViewProps
	private readonly keyScale_: Value<number>
	private readonly prevView_: CubicBezierPreviewView
	private readonly sel_: Value<number>

	constructor(doc: Document, config: Config) {
		this.onKeyDown_ = this.onKeyDown_.bind(this)
		this.onKeyUp_ = this.onKeyUp_.bind(this)
		this.onPointerDown_ = this.onPointerDown_.bind(this)
		this.onPointerMove_ = this.onPointerMove_.bind(this)
		this.onPointerUp_ = this.onPointerUp_.bind(this)

		this.keyScale_ = config.keyScale
		this.value = config.value
		this.sel_ = createValue(0)

		this.viewProps = config.viewProps
		this.view = new CubicBezierGraphView(doc, {
			selection: this.sel_,
			value: this.value,
			viewProps: this.viewProps,
		})
		this.view.element.addEventListener('keydown', this.onKeyDown_)
		this.view.element.addEventListener('keyup', this.onKeyUp_)

		this.prevView_ = new CubicBezierPreviewView(doc, {
			value: this.value,
			viewProps: this.viewProps,
		})
		this.prevView_.element.addEventListener('mousedown', (event) => {
			event.stopImmediatePropagation()
			event.preventDefault()
			this.prevView_.play()
		})
		this.view.previewElement.append(this.prevView_.element)

		const ptHandler = new PointerHandler(this.view.element)
		ptHandler.emitter.on('down', this.onPointerDown_)
		ptHandler.emitter.on('move', this.onPointerMove_)
		ptHandler.emitter.on('up', this.onPointerUp_)
	}

	public refresh(): void {
		this.view.refresh()

		this.prevView_.refresh()
		this.prevView_.play()
	}

	private onKeyDown_(event: KeyboardEvent): void {
		if (isArrowKey(event.key)) {
			event.preventDefault()
		}

		const [xIndex, yIndex] = getHandleComponentIndices(this.sel_.rawValue)
		const comps = this.value.rawValue.toObject()
		const keyScale = this.keyScale_.rawValue
		comps[xIndex] += getStepForKey(keyScale, getHorizontalStepKeys(event))
		comps[yIndex] += getStepForKey(keyScale, getVerticalStepKeys(event))
		this.value.setRawValue(new CubicBezier(...comps), {
			forceEmit: false,
			last: false,
		})
	}

	private onKeyUp_(event: KeyboardEvent): void {
		if (isArrowKey(event.key)) {
			event.preventDefault()
		}

		const keyScale = this.keyScale_.rawValue
		const xStep = getStepForKey(keyScale, getHorizontalStepKeys(event))
		const yStep = getStepForKey(keyScale, getVerticalStepKeys(event))
		if (xStep === 0 && yStep === 0) {
			return
		}

		this.value.setRawValue(this.value.rawValue, {
			forceEmit: true,
			last: true,
		})
	}

	private onPointerDown_(event: PointerHandlerEvent): void {
		const { data } = event
		if (!data.point) {
			return
		}

		const bezier = this.value.rawValue
		const p1 = this.view.valueToPosition(bezier.x1, bezier.y1)
		const d1 = getDistance(data.point.x, data.point.y, p1.x, p1.y)
		const p2 = this.view.valueToPosition(bezier.x2, bezier.y2)
		const d2 = getDistance(data.point.x, data.point.y, p2.x, p2.y)
		this.sel_.rawValue = d1 <= d2 ? 0 : 1
		this.updateValue_(data.point, event.shiftKey, {
			forceEmit: false,
			last: false,
		})
	}

	private onPointerMove_(event: PointerHandlerEvent): void {
		const { data } = event
		if (!data.point) {
			return
		}

		this.updateValue_(data.point, event.shiftKey, {
			forceEmit: false,
			last: false,
		})
	}

	private onPointerUp_(event: PointerHandlerEvent): void {
		const { data } = event
		if (!data.point) {
			return
		}

		this.updateValue_(data.point, event.shiftKey, {
			forceEmit: true,
			last: true,
		})
	}

	private updateValue_(
		point: { x: number; y: number },
		locksAngle: boolean,
		options: ValueChangeOptions,
	): void {
		const index = this.sel_.rawValue
		const [xIndex, yIndex] = getHandleComponentIndices(index)
		const comps = this.value.rawValue.toObject()
		const vp = this.view.positionToValue(point.x, point.y)
		const v = locksAngle ? lockAngle(index, index, vp.x, vp.y) : vp
		comps[xIndex] = v.x
		comps[yIndex] = v.y
		this.value.setRawValue(new CubicBezier(...comps), options)
	}
}
