import { Pane } from 'tweakpane'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CubicBezierApi } from '../src/index'
import {
	cubicBezierFromString,
	cubicBezierToString,
} from '../src/cubic-bezier/converter/cubic-bezier'
import { CubicBezierBladePlugin } from '../src/cubic-bezier/plugin'
import { waitToBeAddedToDom } from '../src/cubic-bezier/view/util'
import * as plugin from '../src/index'
import { CubicBezier } from '../src/index'

const DEFAULT_COMPONENTS = [0, 0.5, 0.5, 1]

async function flushMutations(): Promise<void> {
	await new Promise((resolve) => {
		setTimeout(resolve, 0)
	})
}

function stubLayout(element: HTMLElement, width: number, height: number): void {
	Object.defineProperties(element, {
		clientWidth: { configurable: true, value: width },
		clientHeight: { configurable: true, value: height },
	})
	vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, width, height))
}

function mouseEvent(type: string, x: number, y: number): MouseEvent {
	const event = new MouseEvent(type, { bubbles: true })
	// Happy-dom leaves pageX and pageY at zero.
	Object.defineProperties(event, { pageX: { value: x }, pageY: { value: y } })
	return event
}

const PIXEL_UNIT = /px$/u

function pixels(value: string): number {
	return Number(value.replace(PIXEL_UNIT, ''))
}

function changeInput(input: HTMLInputElement | undefined, value: string): void {
	if (!input) {
		throw new Error('The input was not found')
	}

	input.value = value
	input.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('cubic bezier converter', () => {
	it('formats components with two decimal places', () => {
		expect(cubicBezierToString(new CubicBezier(0.25, 0.1, 0.25, 1))).toBe(
			'cubic-bezier(0.25, 0.10, 0.25, 1.00)',
		)
	})

	it('parses CSS cubic-bezier functions', () => {
		expect(cubicBezierFromString('cubic-bezier(0.25, 0.1, 0.25, 1)').toObject()).toEqual([
			0.25, 0.1, 0.25, 1,
		])
		expect(cubicBezierFromString('cubic-bezier ( 0.42 ,0,1 , 1 )').toObject()).toEqual([
			0.42, 0, 1, 1,
		])
		expect(cubicBezierFromString('cubic-bezier(0.5, -0.5, 0.5, 1.5)').toObject()).toEqual([
			0.5, -0.5, 0.5, 1.5,
		])
		expect(cubicBezierFromString('cubic-bezier(-0.25, -0.5, -0.75, -1)').toObject()).toEqual([
			-0.25, -0.5, -0.75, -1,
		])
	})

	it('round-trips formatted values, including negative components', () => {
		const bezier = new CubicBezier(0.68, -0.6, 0.32, 1.6)
		expect(cubicBezierFromString(cubicBezierToString(bezier)).toObject()).toEqual(bezier.toObject())
	})

	it('falls back to the default curve for invalid text', () => {
		const texts = [
			'',
			'ease',
			'cubic-bezier(0, 0, 1)',
			'cubic-bezier(0, 0, 1, 1, 1)',
			'cubic-bezier(a, 0, 1, 1)',
			'cubic-bezier(1.2.3, 0, 1, 1)',
			'cubic-bezier(., 0, 1, 1)',
		]
		expect(texts.map((text) => cubicBezierFromString(text).toObject())).toEqual(
			texts.map(() => DEFAULT_COMPONENTS),
		)
	})
})

describe('cubic bezier model', () => {
	it('defaults to a linear curve and copies its components', () => {
		const bezier = new CubicBezier()
		const object = bezier.toObject()
		expect(object).toEqual([0, 0, 1, 1])
		object[0] = 0.5
		expect(bezier.x1).toBe(0)
		expect([bezier.x1, bezier.y1, bezier.x2, bezier.y2]).toEqual([0, 0, 1, 1])
	})

	it('compares curves by value', () => {
		expect(
			CubicBezier.equals(new CubicBezier(0.1, 0.2, 0.3, 0.4), new CubicBezier(0.1, 0.2, 0.3, 0.4)),
		).toBe(true)
		expect(
			CubicBezier.equals(new CubicBezier(0.1, 0.2, 0.3, 0.4), new CubicBezier(0.1, 0.2, 0.3, 0.5)),
		).toBe(false)
	})

	it('recognizes four-number arrays as cubic bezier objects', () => {
		expect(CubicBezier.isObject([0, 0, 1, 1])).toBe(true)
		expect(CubicBezier.isObject([0, 0, 1])).toBe(false)
		expect(CubicBezier.isObject(['0', 0, 1, 1])).toBe(false)
		expect(CubicBezier.isObject({ 0: 0, 1: 0, 2: 1, 3: 1 })).toBe(false)
		expect(CubicBezier.isObject(null)).toBe(false)
		expect(CubicBezier.isObject(undefined)).toBe(false)
	})

	it('evaluates the curve between its fixed end points', () => {
		const bezier = new CubicBezier(0.42, 0, 0.58, 1)
		expect(bezier.curve(0)).toEqual([0, 0])
		expect(bezier.curve(1)).toEqual([1, 1])
		const [x, y] = bezier.curve(0.5)
		expect(x).toBeCloseTo(0.5)
		expect(y).toBeCloseTo(0.5)
	})

	it('solves y for x and clamps x to the unit range', () => {
		const linear = new CubicBezier(0, 0, 1, 1)
		expect(linear.y(0)).toBeCloseTo(0, 1)
		expect(linear.y(0.3)).toBeCloseTo(0.3, 1)
		expect(linear.y(1)).toBeCloseTo(1, 1)
		expect(linear.y(-1)).toBe(linear.y(0))
		expect(linear.y(2)).toBe(linear.y(1))

		const easeIn = new CubicBezier(0.42, 0, 1, 1)
		expect(easeIn.y(0.25)).toBeLessThan(0.25)
	})

	it('returns NaN for a NaN input', () => {
		expect(new CubicBezier().y(NaN)).toBeNaN()
	})
})

describe(waitToBeAddedToDom.name, () => {
	afterEach(() => {
		document.body.replaceChildren()
	})

	it('waits for the element itself and calls back only once', async () => {
		const element = document.createElement('div')
		const callback = vi.fn<() => void>()
		waitToBeAddedToDom(element, callback)

		document.body.append(document.createElement('span'))
		await flushMutations()
		expect(callback).not.toHaveBeenCalled()

		document.body.append(element, document.createElement('span'))
		await flushMutations()
		expect(callback).toHaveBeenCalledOnce()

		document.body.append(document.createElement('span'))
		await flushMutations()
		expect(callback).toHaveBeenCalledOnce()
	})

	it('calls back when an ancestor of the element is added', async () => {
		const container = document.createElement('div')
		const element = document.createElement('div')
		container.append(element)
		const callback = vi.fn<() => void>()
		waitToBeAddedToDom(element, callback)

		document.body.append(container)
		await flushMutations()
		expect(callback).toHaveBeenCalledOnce()
	})

	it('calls back immediately when the element is already connected', () => {
		const element = document.createElement('div')
		document.body.append(element)
		const callback = vi.fn<() => void>()
		waitToBeAddedToDom(element, callback)
		expect(callback).toHaveBeenCalledOnce()
	})
})

describe('cubic bezier blade plugin', () => {
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
	})

	function setup(params: Record<string, unknown> = {}) {
		pane = new Pane()
		pane.registerPlugin(plugin)
		const api = pane.addBlade({
			expanded: true,
			label: 'Easing',
			picker: 'inline',
			value: [0.5, 0, 0.5, 1],
			view: 'cubicbezier',
			...params,
		}) as CubicBezierApi
		const [textInput, ...componentInputs] = api.element.querySelectorAll('input')
		const changes: Array<{ last: boolean; value: number[] }> = []
		api.on('change', (event) => {
			changes.push({ last: event.last, value: event.value.toObject() })
		})
		return { api, changes, componentInputs, pane, textInput }
	}

	it('accepts only valid cubic bezier params', () => {
		expect(
			CubicBezierBladePlugin.accept({ value: [0, 0, 1, 1], view: 'cubicbezier' }),
		).not.toBeNull()
		expect(
			CubicBezierBladePlugin.accept({ picker: 'inline', value: [0, 0, 1, 1], view: 'cubicbezier' }),
		).not.toBeNull()
		expect(CubicBezierBladePlugin.accept({ value: [0, 0, 1, 1], view: 'cubic' })).toBeNull()
		expect(CubicBezierBladePlugin.accept({ view: 'cubicbezier' })).toBeNull()
		expect(CubicBezierBladePlugin.accept({ value: ['0', 0, 1, 1], view: 'cubicbezier' })).toBeNull()
		expect(
			CubicBezierBladePlugin.accept({ expanded: 'yes', value: [0, 0, 1, 1], view: 'cubicbezier' }),
		).toBeNull()
	})

	it('shows the value as text and as component inputs', () => {
		const { api, componentInputs, textInput } = setup()
		expect(api.value.toObject()).toEqual([0.5, 0, 0.5, 1])
		expect(textInput?.value).toBe('cubic-bezier(0.50, 0.00, 0.50, 1.00)')
		expect(componentInputs.map((input) => input.value)).toEqual(['0.50', '0.00', '0.50', '1.00'])
		expect(api.label).toBe('Easing')
		api.label = 'Timing'
		expect(api.element.textContent).toContain('Timing')
	})

	it('writes edited text and emits a final change event', () => {
		const { api, changes, componentInputs, textInput } = setup()
		changeInput(textInput, 'cubic-bezier(0.1, -0.2, 0.3, 1.4)')
		expect(api.value.toObject()).toEqual([0.1, -0.2, 0.3, 1.4])
		expect(changes).toEqual([{ last: true, value: [0.1, -0.2, 0.3, 1.4] }])
		expect(componentInputs.map((input) => input.value)).toEqual(['0.10', '-0.20', '0.30', '1.40'])
	})

	it('constrains x components to the unit range and resets invalid text', () => {
		const { api, textInput } = setup()
		changeInput(textInput, 'cubic-bezier(1.5, 0, -0.5, 1)')
		expect(api.value.toObject()).toEqual([1, 0, 0, 1])
		changeInput(textInput, 'ease-in')
		expect(api.value.toObject()).toEqual(DEFAULT_COMPONENTS)
	})

	it('writes edits from the component inputs', () => {
		const { api, componentInputs } = setup()
		changeInput(componentInputs[0], '0.25')
		changeInput(componentInputs[3], '0.75')
		expect(api.value.toObject()).toEqual([0.25, 0, 0.5, 0.75])
	})

	it('moves the selected handle with the arrow keys', () => {
		const { api, changes } = setup()
		const graph = api.element.querySelector<HTMLElement>('.tp-cbzgv')
		if (!graph) {
			throw new Error('The graph was not created')
		}

		graph.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }))
		graph.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'ArrowUp' }))
		expect(api.value.x1).toBe(0.5)
		expect(api.value.y1).toBeCloseTo(0.1)
		expect(changes.map((change) => change.last)).toEqual([false, true])
	})

	it('selects the handle nearest to the pointer and drags it', () => {
		const { api, changes } = setup()
		const graph = api.element.querySelector<HTMLElement>('.tp-cbzgv')
		if (!graph) {
			throw new Error('The graph was not created')
		}

		// The graph maps y from 0 to 1 onto 75 to 25 pixels in a 100 by 100 box.
		stubLayout(graph, 100, 100)
		graph.dispatchEvent(mouseEvent('mousedown', 50, 30))
		document.dispatchEvent(mouseEvent('mouseup', 60, 35))
		expect(api.value.x1).toBe(0.5)
		expect(api.value.y1).toBe(0)
		expect(api.value.x2).toBeCloseTo(0.6)
		expect(api.value.y2).toBeCloseTo(0.8)
		expect(changes.at(-1)?.last).toBe(true)

		const handles = [...graph.querySelectorAll<HTMLElement>('.tp-cbzgv_h')]
		expect(handles.map((handle) => [pixels(handle.style.left), pixels(handle.style.top)])).toEqual([
			[expect.closeTo(50), expect.closeTo(75)],
			[expect.closeTo(60), expect.closeTo(35)],
		])
		const vector = graph.querySelectorAll('.tp-cbzgv_v')[1]
		expect(['x1', 'y1', 'x2', 'y2'].map((name) => Number(vector?.getAttribute(name)))).toEqual([
			expect.closeTo(100),
			expect.closeTo(25),
			expect.closeTo(60),
			expect.closeTo(35),
		])

		graph.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))
		expect(api.value.x2).toBeCloseTo(0.7)
		expect(api.value.x1).toBe(0.5)
	})

	it('refreshes inputs when the value is set through the API', () => {
		const { api, changes, textInput } = setup()
		api.value = new CubicBezier(0.2, 0.3, 0.4, 0.5)
		expect(textInput?.value).toBe('cubic-bezier(0.20, 0.30, 0.40, 0.50)')
		expect(changes).toEqual([{ last: true, value: [0.2, 0.3, 0.4, 0.5] }])
	})

	it('toggles the popup picker with its button and closes it with Escape', () => {
		const { api, componentInputs } = setup({ expanded: false, picker: 'popup' })
		const button = api.element.querySelector<HTMLButtonElement>('.tp-cbzv_b')
		const popup = api.element.querySelector('.tp-popv')
		expect(popup?.classList.contains('tp-popv-v')).toBe(false)
		button?.click()
		expect(popup?.classList.contains('tp-popv-v')).toBe(true)
		componentInputs[0]?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
		)
		expect(popup?.classList.contains('tp-popv-v')).toBe(false)
	})

	it('disables its controls with the pane', () => {
		const { api, componentInputs, pane: currentPane, textInput } = setup()
		currentPane.disabled = true
		expect(textInput?.disabled).toBe(true)
		expect(componentInputs.every((input) => input.disabled)).toBe(true)
		expect(api.element.querySelector<HTMLButtonElement>('.tp-cbzv_b')?.disabled).toBe(true)
	})

	it('removes its elements when disposed', () => {
		const { api, textInput } = setup()
		api.dispose()
		expect(api.element.isConnected).toBe(false)
		expect(textInput?.isConnected).toBe(false)
	})
})
