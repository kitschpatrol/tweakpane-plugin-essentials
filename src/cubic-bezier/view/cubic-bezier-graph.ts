import type { Value, View, ViewProps } from '@tweakpane/core'
import {
	bindValue,
	ClassName,
	constrainRange,
	mapRange,
	SVG_NS,
	valueToClassName,
} from '@tweakpane/core'
import type { CubicBezier } from '../model/cubic-bezier'
import { waitToBeAddedToDom } from './util'

type Config = {
	selection: Value<number>
	value: Value<CubicBezier>
	viewProps: ViewProps
}

const className = ClassName('cbzg')

// TODO: Apply to core
function compose<A, B, C>(h1: (input: A) => B, h2: (input: B) => C): (input: A) => C {
	return (input) => h2(h1(input))
}

export class CubicBezierGraphView implements View {
	public readonly element: HTMLElement
	public previewElement: HTMLElement
	private readonly guideElem_: SVGElement
	private readonly handleElems_: [HTMLElement, HTMLElement]
	private readonly lineElem_: Element
	private readonly sel_: Value<number>
	private readonly svgElem_: SVGElement
	private readonly value_: Value<CubicBezier>
	private readonly vectorElems_: [Element, Element]

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)
		config.viewProps.bindTabIndex(this.element)

		const previewElement = doc.createElement('div')
		previewElement.classList.add(className('p'))
		this.element.append(previewElement)
		this.previewElement = previewElement

		const svgElement = doc.createElementNS(SVG_NS, 'svg')
		svgElement.classList.add(className('g'))
		this.element.append(svgElement)
		this.svgElem_ = svgElement

		const guideElement = doc.createElementNS(SVG_NS, 'path')
		guideElement.classList.add(className('u'))
		this.svgElem_.append(guideElement)
		this.guideElem_ = guideElement

		const lineElement = doc.createElementNS(SVG_NS, 'polyline')
		lineElement.classList.add(className('l'))
		this.svgElem_.append(lineElement)
		this.lineElem_ = lineElement

		this.handleElems_ = [doc.createElement('div'), doc.createElement('div')]
		for (const element of this.handleElems_) {
			element.classList.add(className('h'))
			this.element.append(element)
		}

		this.vectorElems_ = [doc.createElementNS(SVG_NS, 'line'), doc.createElementNS(SVG_NS, 'line')]
		for (const element of this.vectorElems_) {
			element.classList.add(className('v'))
			this.svgElem_.append(element)
		}

		this.value_ = config.value
		this.value_.emitter.on('change', this.onValueChange_.bind(this))

		this.sel_ = config.selection
		for (const [index, element] of this.handleElems_.entries()) {
			bindValue(
				this.sel_,
				compose(
					(selection) => selection === index,
					valueToClassName(element, className('h', 'sel')),
				),
			)
		}

		waitToBeAddedToDom(this.element, () => {
			this.refresh()
		})
	}

	public positionToValue(x: number, y: number): { x: number; y: number } {
		const bounds = this.element.getBoundingClientRect()
		const w = bounds.width
		const h = bounds.height
		const vm = this.getVertMargin_(h)
		return {
			x: constrainRange(mapRange(x, 0, w, 0, 1), 0, 1),
			y: mapRange(y, h - vm, vm, 0, 1),
		}
	}

	public refresh(): void {
		this.guideElem_.setAttributeNS(
			null,
			'd',
			[0, 1]
				.map((index) => {
					const p1 = this.valueToPosition(0, index)
					const p2 = this.valueToPosition(1, index)
					return [`M ${p1.x},${p1.y}`, `L ${p2.x},${p2.y}`].join(' ')
				})
				.join(' '),
		)

		const bezier = this.value_.rawValue
		const points: string[] = []
		let t = 0
		for (;;) {
			const p = this.valueToPosition(...bezier.curve(t))
			points.push([p.x, p.y].join(','))
			if (t >= 1) {
				break
			}

			t = Math.min(t + 0.05, 1)
		}

		this.lineElem_.setAttributeNS(null, 'points', points.join(' '))

		const handles = [
			{
				anchor: 0,
				handleElement: this.handleElems_[0],
				vectorElement: this.vectorElems_[0],
				x: bezier.x1,
				y: bezier.y1,
			},
			{
				anchor: 1,
				handleElement: this.handleElems_[1],
				vectorElement: this.vectorElems_[1],
				x: bezier.x2,
				y: bezier.y2,
			},
		]
		for (const handle of handles) {
			const p1 = this.valueToPosition(handle.anchor, handle.anchor)
			const p2 = this.valueToPosition(handle.x, handle.y)
			handle.vectorElement.setAttributeNS(null, 'x1', String(p1.x))
			handle.vectorElement.setAttributeNS(null, 'y1', String(p1.y))
			handle.vectorElement.setAttributeNS(null, 'x2', String(p2.x))
			handle.vectorElement.setAttributeNS(null, 'y2', String(p2.y))
			handle.handleElement.style.left = `${p2.x}px`
			handle.handleElement.style.top = `${p2.y}px`
		}
	}

	public valueToPosition(x: number, y: number): { x: number; y: number } {
		const { clientWidth: w, clientHeight: h } = this.element
		const vm = this.getVertMargin_(h)
		return {
			x: mapRange(x, 0, 1, 0, w),
			y: mapRange(y, 0, 1, h - vm, vm),
		}
	}

	private getVertMargin_(h: number): number {
		return h * 0.25
	}

	private onValueChange_() {
		this.refresh()
	}
}
