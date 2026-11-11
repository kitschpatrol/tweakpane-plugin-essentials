import type { Value, View, ViewProps } from '@tweakpane/core'
import { ClassName, constrainRange, mapRange, SVG_NS } from '@tweakpane/core'
import type { CubicBezier } from '../model/cubic-bezier'
import { waitToBeAddedToDom } from './util'

type Config = {
	value: Value<CubicBezier>
	viewProps: ViewProps
}

const TICK_COUNT = 24
const PREVIEW_DELAY = 400
const PREVIEW_DURATION = 1000
const className = ClassName('cbzprv')

export class CubicBezierPreviewView implements View {
	public readonly element: HTMLElement
	private readonly markerElem_: HTMLElement
	private requestId_ = -1
	private startTime_ = -1
	private stopped_ = true
	private readonly svgElem_: Element
	private readonly ticksElem_: Element
	private readonly value_: Value<CubicBezier>

	constructor(doc: Document, config: Config) {
		this.onDispose_ = this.onDispose_.bind(this)
		this.onTimer_ = this.onTimer_.bind(this)
		this.onValueChange_ = this.onValueChange_.bind(this)

		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)

		const svgElement = doc.createElementNS(SVG_NS, 'svg')
		svgElement.classList.add(className('g'))
		this.element.append(svgElement)
		this.svgElem_ = svgElement

		const ticksElement = doc.createElementNS(SVG_NS, 'path')
		ticksElement.classList.add(className('t'))
		this.svgElem_.append(ticksElement)
		this.ticksElem_ = ticksElement

		const markerElement = doc.createElement('div')
		markerElement.classList.add(className('m'))
		this.element.append(markerElement)
		this.markerElem_ = markerElement

		this.value_ = config.value
		this.value_.emitter.on('change', this.onValueChange_)

		config.viewProps.handleDispose(this.onDispose_)
		waitToBeAddedToDom(this.element, () => {
			this.refresh()
		})
	}

	public play(): void {
		this.stop()

		this.updateMarker_(0)
		this.markerElem_.classList.add(className('m', 'a'))

		this.startTime_ = Date.now() + PREVIEW_DELAY
		this.stopped_ = false
		this.requestId_ = requestAnimationFrame(this.onTimer_)
	}

	public refresh(): void {
		const { clientWidth: w, clientHeight: h } = this.svgElem_
		const ds: string[] = []
		const bezier = this.value_.rawValue
		for (let i = 0; i < TICK_COUNT; i++) {
			const px = mapRange(i, 0, TICK_COUNT - 1, 0, 1)
			const x = mapRange(bezier.y(px), 0, 1, 0, w)
			ds.push(`M ${x},0 v${h}`)
		}

		this.ticksElem_.setAttributeNS(null, 'd', ds.join(' '))
	}

	public stop(): void {
		cancelAnimationFrame(this.requestId_)
		this.stopped_ = true
		this.markerElem_.classList.remove(className('m', 'a'))
	}

	private onDispose_(): void {
		this.stop()
	}

	private onTimer_(): void {
		const dt = Date.now() - this.startTime_
		const p = dt / PREVIEW_DURATION
		this.updateMarker_(p)

		if (dt > PREVIEW_DURATION + PREVIEW_DELAY) {
			this.stop()
		}

		if (!this.stopped_) {
			this.requestId_ = requestAnimationFrame(this.onTimer_)
		}
	}

	private onValueChange_() {
		this.refresh()

		this.play()
	}

	private updateMarker_(progress: number): void {
		const p = this.value_.rawValue.y(constrainRange(progress, 0, 1))
		this.markerElem_.style.left = `${p * 100}%`
	}
}
