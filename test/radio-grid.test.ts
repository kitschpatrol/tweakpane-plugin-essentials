import { Pane } from 'tweakpane'
import { afterEach, describe, expect, it } from 'vitest'
import type { RadioGridApi } from '../src/index'
import * as plugin from '../src/index'
import { RadioGridBladePlugin } from '../src/radio-grid/blade-plugin'
import {
	RadioGridBooleanInputPlugin,
	RadioGridNumberInputPlugin,
	RadioGridStringInputPlugin,
} from '../src/radio-grid/input-plugin'

type Primitive = boolean | number | string

function valueAt(values: Primitive[], index: number): Primitive {
	const value = values.at(index)
	if (value === undefined) {
		throw new Error(`No value at index ${index}`)
	}

	return value
}

function checkedStates(inputs: HTMLInputElement[]): boolean[] {
	return inputs.map((input) => input.checked)
}

describe('radio grid blade plugin', () => {
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
	})

	function setup() {
		pane = new Pane()
		pane.registerPlugin(plugin)
		const api = pane.addBlade({
			cells: (x: number, y: number) => ({ title: `${x},${y}`, value: x + y * 2 }),
			groupName: 'blade-group',
			label: 'Choice',
			size: [2, 2],
			value: 2,
			view: 'radiogrid',
		}) as RadioGridApi<number>
		const inputs = [...api.element.querySelectorAll('input')]
		const changes: Array<{ index: [number, number]; last: boolean; title: string; value: number }> =
			[]
		api.on('change', (event) => {
			changes.push({
				index: event.index,
				last: event.last,
				title: event.cell.title,
				value: event.value,
			})
		})
		return { api, changes, inputs }
	}

	it('accepts only valid radio grid params', () => {
		const cells = () => ({ title: 'A', value: 1 })
		const valid = { cells, groupName: 'group', size: [2, 2], value: 1, view: 'radiogrid' }
		expect(RadioGridBladePlugin.accept(valid)).not.toBeNull()
		expect(RadioGridBladePlugin.accept({ ...valid, view: 'radio' })).toBeNull()
		expect(RadioGridBladePlugin.accept({ ...valid, groupName: undefined })).toBeNull()
		expect(RadioGridBladePlugin.accept({ ...valid, cells: undefined })).toBeNull()
		expect(RadioGridBladePlugin.accept({ ...valid, size: ['2', 2] })).toBeNull()
	})

	it('creates a named radio input per cell and checks the initial value', () => {
		const { api, inputs } = setup()
		expect(inputs.map((input) => input.name)).toEqual([
			'blade-group',
			'blade-group',
			'blade-group',
			'blade-group',
		])
		expect(api.element.textContent).toContain('Choice')
		expect(
			Array.from(api.element.querySelectorAll('.tp-radv_t'), (title) => title.textContent),
		).toEqual(['0,0', '1,0', '0,1', '1,1'])
		expect(checkedStates(inputs)).toEqual([false, false, true, false])
	})

	it('selects the clicked cell and emits its index and value', () => {
		const { api, changes, inputs } = setup()
		inputs[1]?.click()
		expect(api.value.rawValue).toBe(1)
		expect(checkedStates(inputs)).toEqual([false, true, false, false])
		expect(changes).toEqual([{ index: [1, 0], last: true, title: '1,0', value: 1 }])
	})

	it('checks the matching cell when the value changes externally', () => {
		const { api, changes, inputs } = setup()
		api.value.rawValue = 3
		expect(checkedStates(inputs)).toEqual([false, false, false, true])
		expect(changes).toEqual([{ index: [1, 1], last: true, title: '1,1', value: 3 }])

		api.value.rawValue = 99
		expect(checkedStates(inputs)).toEqual([false, false, false, true])
		expect(changes).toHaveLength(1)
	})

	it('exposes and disables cells by position', () => {
		const { api, inputs } = setup()
		const cell = api.cell(1, 1)
		expect(cell?.title).toBe('1,1')
		expect(api.cell(0, 2)).toBeUndefined()
		if (!cell) {
			throw new Error('The cell was not found')
		}

		cell.title = 'Last'
		expect(api.element.querySelectorAll('.tp-radv_t')[3]?.textContent).toBe('Last')
		cell.disabled = true
		expect(cell.disabled).toBe(true)
		expect(inputs[3]?.disabled).toBe(true)
		expect(inputs[0]?.disabled).toBe(false)
	})

	it('removes its inputs when disposed', () => {
		const { api, inputs } = setup()
		api.dispose()
		expect(api.element.isConnected).toBe(false)
		expect(inputs.some((input) => input.isConnected)).toBe(false)
	})
})

describe('radio grid input plugins', () => {
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
	})

	function setup(values: Primitive[]) {
		pane = new Pane()
		pane.registerPlugin(plugin)
		const params = { choice: valueAt(values, 0) }
		const binding = pane.addBinding(params, 'choice', {
			cells: (x: number) => ({ title: String(values[x]), value: values[x] }),
			groupName: 'input-group',
			size: [values.length, 1],
			view: 'radiogrid',
		})
		const inputs = [...binding.element.querySelectorAll('input')]
		const changes: Array<{ last: boolean; value: unknown }> = []
		binding.on('change', (event) => {
			changes.push({ last: event.last, value: event.value })
		})
		return { binding, changes, inputs, params }
	}

	it('accepts only values of their own type', () => {
		const params = {
			cells: () => ({ title: 'A', value: 1 }),
			groupName: 'group',
			size: [1, 1],
			view: 'radiogrid',
		}
		expect(RadioGridNumberInputPlugin.accept(1, params)).not.toBeNull()
		expect(RadioGridNumberInputPlugin.accept('1', params)).toBeNull()
		expect(RadioGridStringInputPlugin.accept('a', params)).not.toBeNull()
		expect(RadioGridStringInputPlugin.accept(1, params)).toBeNull()
		expect(RadioGridBooleanInputPlugin.accept(true, params)).not.toBeNull()
		expect(RadioGridBooleanInputPlugin.accept('true', params)).toBeNull()
		expect(RadioGridNumberInputPlugin.accept(1, { ...params, view: 'list' })).toBeNull()
		expect(RadioGridNumberInputPlugin.accept(1, { ...params, groupName: 1 })).toBeNull()
	})

	for (const testCase of [
		{ type: 'number', values: [10, 20, 30] },
		{ type: 'string', values: ['low', 'mid', 'high'] },
		{ type: 'boolean', values: [true, false] },
	]) {
		describe(`with ${testCase.type} values`, () => {
			it('writes the clicked cell value and emits a final change event', () => {
				const { changes, inputs, params } = setup(testCase.values)
				expect(checkedStates(inputs)[0]).toBe(true)
				inputs[1]?.click()
				expect(params.choice).toBe(testCase.values[1])
				expect(changes).toEqual([{ last: true, value: testCase.values[1] }])
			})

			it('checks the matching cell after an external change', () => {
				const { binding, inputs, params } = setup(testCase.values)
				params.choice = valueAt(testCase.values, -1)
				binding.refresh()
				expect(checkedStates(inputs).at(-1)).toBe(true)
				expect(checkedStates(inputs)[0]).toBe(false)
			})
		})
	}
})
