import { Pane } from 'tweakpane'
import { afterEach, assert, describe as context, describe, expect, it, vi } from 'vitest'
import * as plugin from '../src/index'
import { Interval, IntervalAssembly, IntervalConstraint } from '../src/index'
import { intervalFromUnknown } from '../src/interval/converter/interval'
import { IntervalInputPlugin } from '../src/interval/plugin'

describe(Interval.name, () => {
	for (const testCase of [
		{
			expected: false,
			object: undefined,
		},
		{
			expected: false,
			object: {},
		},
		{
			expected: false,
			object: { min: 1 },
		},
		{
			expected: false,
			object: { max: 2 },
		},
		{
			expected: false,
			object: { min: 'foobar', max: 2 },
		},
		{
			expected: false,
			object: { min: 1, max: 'foobar' },
		},
		{
			expected: true,
			object: { min: 0, max: 100 },
		},
	]) {
		context(`when ${JSON.stringify(testCase.object)}`, () => {
			it(`should be object: ${JSON.stringify(testCase.expected)}`, () => {
				assert.strictEqual(Interval.isObject(testCase.object), testCase.expected)
			})
		})
	}

	for (const testCase of [
		{
			expected: true,
			params: {
				v1: new Interval(0, 100),
				v2: new Interval(0, 100),
			},
		},
		{
			expected: false,
			params: {
				v1: new Interval(0, 100),
				v2: new Interval(-1, 100),
			},
		},
		{
			expected: false,
			params: {
				v1: new Interval(0, 99.9),
				v2: new Interval(0, 100),
			},
		},
	]) {
		context(`when ${JSON.stringify(testCase.params)}`, () => {
			it(`should determine equality: ${JSON.stringify(testCase.expected)}`, () => {
				assert.strictEqual(
					Interval.equals(testCase.params.v1, testCase.params.v2),
					testCase.expected,
				)
			})
		})
	}

	for (const testCase of [
		{
			expected: 100,
			interval: new Interval(0, 100),
		},
	]) {
		context(`when ${JSON.stringify(testCase.interval)}`, () => {
			it(`should have length: ${JSON.stringify(testCase.expected)}`, () => {
				assert.strictEqual(testCase.interval.length, testCase.expected)
			})
		})
	}

	for (const testCase of [
		{
			expected: { min: 0, max: 100 },
			interval: new Interval(0, 100),
		},
	]) {
		context(`when ${JSON.stringify(testCase.interval)}`, () => {
			it(`should be object: ${JSON.stringify(testCase.expected)}`, () => {
				assert.deepStrictEqual(testCase.interval.toObject(), testCase.expected)
			})
		})
	}
})

describe('interval assembly and converter', () => {
	it('converts intervals to and from components', () => {
		expect(IntervalAssembly.toComponents(new Interval(1, 2))).toEqual([1, 2])
		expect(IntervalAssembly.fromComponents([3, 4])).toEqual(new Interval(3, 4))
		expect(IntervalAssembly.fromComponents([])).toEqual(new Interval(0, 0))
	})

	it('reads interval objects and falls back to an empty interval', () => {
		expect(intervalFromUnknown({ min: -1, max: 1 })).toEqual(new Interval(-1, 1))
		expect(intervalFromUnknown({ min: 1 })).toEqual(new Interval(0, 0))
		expect(intervalFromUnknown('0..1')).toEqual(new Interval(0, 0))
	})
})

describe(IntervalConstraint.name, () => {
	it('applies the edge constraint to both ends', () => {
		const constraint = new IntervalConstraint({
			constrain: (value) => Math.min(Math.max(value, 0), 10),
		})
		expect(constraint.constrain(new Interval(-5, 20))).toEqual(new Interval(0, 10))
	})

	it('collapses a reversed interval to its midpoint', () => {
		expect(new IntervalConstraint().constrain(new Interval(8, 2))).toEqual(new Interval(5, 5))
		const constraint = new IntervalConstraint({ constrain: (value) => Math.round(value) })
		expect(constraint.constrain(new Interval(4, 1))).toEqual(new Interval(3, 3))
	})
})

describe('interval input plugin', () => {
	const RANGE_PARAMS = { min: 0, max: 10 }
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
	})

	function setup(bindingParams: Record<string, unknown> = RANGE_PARAMS) {
		pane = new Pane()
		pane.registerPlugin(plugin)
		const range = { min: 2, max: 8 }
		const params = { range }
		const binding = pane.addBinding(params, 'range', bindingParams)
		const inputs = [...binding.element.querySelectorAll('input')]
		const changes: Array<{ last: boolean; max: number; min: number }> = []
		binding.on('change', (event) => {
			changes.push({ last: event.last, ...event.value })
		})
		return { binding, changes, inputs, pane, params, range }
	}

	function changeInput(input: HTMLInputElement | undefined, value: string): void {
		if (!input) {
			throw new Error('The input was not found')
		}

		input.value = value
		input.dispatchEvent(new Event('change', { bubbles: true }))
	}

	function mouseEvent(type: string, x: number): MouseEvent {
		const event = new MouseEvent(type, { bubbles: true })
		// Happy-dom leaves pageX at zero.
		Object.defineProperty(event, 'pageX', { value: x })
		return event
	}

	function getTrack(element: HTMLElement): HTMLElement {
		const track = element.querySelector<HTMLElement>('.tp-rslv_t')
		if (!track) {
			throw new Error('The slider track was not created')
		}

		vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10))
		return track
	}

	it('accepts only interval objects with valid number params', () => {
		expect(IntervalInputPlugin.accept({ min: 0, max: 1 }, {})?.initialValue).toEqual(
			new Interval(0, 1),
		)
		expect(
			IntervalInputPlugin.accept({ min: 0, max: 1 }, { max: 1, min: 0, step: 0.1 }),
		).not.toBeNull()
		expect(IntervalInputPlugin.accept(1, {})).toBeNull()
		expect(IntervalInputPlugin.accept({ min: 0 }, {})).toBeNull()
		expect(IntervalInputPlugin.accept({ min: 0, max: 1 }, { readonly: true })).toBeNull()
		expect(IntervalInputPlugin.accept({ min: 0, max: 1 }, { step: 'fine' })).toBeNull()
	})

	it('shows only text inputs without a range', () => {
		const { binding, inputs } = setup({})
		expect(inputs.map((input) => Number(input.value))).toEqual([2, 8])
		expect(binding.element.querySelector('.tp-rslv')).toBeNull()
	})

	it('shows a slider beside the text inputs with a range', () => {
		const { binding, inputs } = setup()
		expect(inputs.map((input) => Number(input.value))).toEqual([2, 8])
		expect(binding.element.querySelector('.tp-rsltxtv')?.querySelector('.tp-rslv')).not.toBeNull()
	})

	it('writes text edits into the bound object and emits a final change event', () => {
		const { changes, inputs, params, range } = setup()
		changeInput(inputs[0], '3')
		expect(params.range).toBe(range)
		expect(range).toEqual({ min: 3, max: 8 })
		expect(changes).toEqual([{ last: true, max: 8, min: 3 }])
	})

	it('constrains edits to the range and collapses reversed intervals', () => {
		const { inputs, range } = setup({ max: 10, min: 0, step: 1 })
		changeInput(inputs[1], '20')
		expect(range).toEqual({ min: 2, max: 10 })
		changeInput(inputs[0], '2.4')
		expect(range).toEqual({ min: 2, max: 10 })
		changeInput(inputs[0], '12')
		expect(range).toEqual({ min: 10, max: 10 })
	})

	it('drags the whole interval from the bar and keeps it inside the range', () => {
		const { binding, changes, range } = setup()
		const track = getTrack(binding.element)
		track.dispatchEvent(mouseEvent('mousedown', 50))
		document.dispatchEvent(mouseEvent('mousemove', 60))
		document.dispatchEvent(mouseEvent('mouseup', 60))
		expect(range).toEqual({ min: 3, max: 9 })
		expect(changes).toEqual([
			{ last: false, max: 9, min: 3 },
			{ last: true, max: 9, min: 3 },
		])

		track.dispatchEvent(mouseEvent('mousedown', 60))
		document.dispatchEvent(mouseEvent('mouseup', 95))
		expect(range).toEqual({ min: 4, max: 10 })
	})

	it('drags a knob, or jumps the nearest end to a click outside the interval', () => {
		const { binding, range } = setup()
		const track = getTrack(binding.element)
		track.dispatchEvent(mouseEvent('mousedown', 20))
		document.dispatchEvent(mouseEvent('mouseup', 10))
		expect(range).toEqual({ min: 1, max: 8 })

		track.dispatchEvent(mouseEvent('mousedown', 95))
		expect(range).toEqual({ min: 1, max: 9.5 })
		document.dispatchEvent(mouseEvent('mouseup', 95))
	})

	it('moves the slider and text when the value changes externally', () => {
		const { binding, inputs, range } = setup()
		range.min = 4
		binding.refresh()
		expect(Number(inputs[0]?.value)).toBe(4)
		const bar = binding.element.querySelector<HTMLElement>('.tp-rslv_b')
		const knobs = [...binding.element.querySelectorAll<HTMLElement>('.tp-rslv_k')]
		expect(bar?.style.left).toBe('40%')
		expect(bar?.style.right).toBe('20%')
		expect(knobs.map((knob) => knob.style.left)).toEqual(['40%', '80%'])
	})

	it('disables its text inputs with the pane', () => {
		const { inputs, pane: currentPane } = setup()
		currentPane.disabled = true
		expect(inputs.every((input) => input.disabled)).toBe(true)
	})

	it('removes its elements when disposed', () => {
		const { binding, inputs } = setup()
		binding.dispose()
		expect(binding.element.isConnected).toBe(false)
		expect(inputs.some((input) => input.isConnected)).toBe(false)
	})
})
