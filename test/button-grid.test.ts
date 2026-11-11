import { Pane } from 'tweakpane'
import { afterEach, describe, expect, it } from 'vitest'
import type { ButtonGridApi } from '../src/index'
import { ButtonGridBladePlugin } from '../src/button-grid/plugin'
import * as plugin from '../src/index'

describe('button grid blade plugin', () => {
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
	})

	function setup() {
		pane = new Pane()
		pane.registerPlugin(plugin)
		const api = pane.addBlade({
			cells: (x: number, y: number) => ({ title: `${x},${y}` }),
			label: 'Grid',
			size: [3, 2],
			view: 'buttongrid',
		}) as ButtonGridApi
		const buttons = [...api.element.querySelectorAll('button')]
		return { api, buttons }
	}

	it('accepts only valid button grid params', () => {
		const cells = () => ({ title: 'A' })
		expect(ButtonGridBladePlugin.accept({ cells, size: [2, 2], view: 'buttongrid' })).not.toBeNull()
		expect(ButtonGridBladePlugin.accept({ cells, size: [2, 2], view: 'button' })).toBeNull()
		expect(ButtonGridBladePlugin.accept({ size: [2, 2], view: 'buttongrid' })).toBeNull()
		expect(ButtonGridBladePlugin.accept({ cells, view: 'buttongrid' })).toBeNull()
		expect(
			ButtonGridBladePlugin.accept({ cells, label: 1, size: [2, 2], view: 'buttongrid' }),
		).toBeNull()
	})

	it('creates one button per cell in row-major order with a label', () => {
		const { api, buttons } = setup()
		expect(buttons.map((button) => button.textContent)).toEqual([
			'0,0',
			'1,0',
			'2,0',
			'0,1',
			'1,1',
			'2,1',
		])
		expect(api.element.querySelector('.tp-btngridv')?.getAttribute('style')).toContain(
			'repeat(3, 1fr)',
		)
		expect(api.element.textContent).toContain('Grid')
	})

	it('emits click events with the clicked cell and its index', () => {
		const { api, buttons } = setup()
		const clicks: Array<{ index: [number, number]; title: string }> = []
		api.on('click', (event) => {
			clicks.push({ index: event.index, title: event.cell.title })
		})
		buttons[4]?.click()
		buttons[2]?.click()
		expect(clicks).toEqual([
			{ index: [1, 1], title: '1,1' },
			{ index: [2, 0], title: '2,0' },
		])
	})

	it('exposes cells by position and returns undefined outside the grid', () => {
		const { api, buttons } = setup()
		const cell = api.cell(2, 1)
		expect(cell?.title).toBe('2,1')
		expect(api.cell(0, 2)).toBeUndefined()
		expect(api.cell(-1, 0)).toBeUndefined()
		if (!cell) {
			throw new Error('The cell was not found')
		}

		cell.title = 'Renamed'
		expect(buttons[5]?.textContent).toBe('Renamed')

		const cellClicks: string[] = []
		cell.on('click', () => {
			cellClicks.push(cell.title)
		})
		buttons[5]?.click()
		expect(cellClicks).toEqual(['Renamed'])
	})

	it('disables individual cells', () => {
		const { api, buttons } = setup()
		const cell = api.cell(0, 0)
		if (!cell) {
			throw new Error('The cell was not found')
		}

		cell.disabled = true
		expect(cell.disabled).toBe(true)
		expect(buttons[0]?.disabled).toBe(true)
		expect(buttons[1]?.disabled).toBe(false)
		cell.disabled = false
		expect(buttons[0]?.disabled).toBe(false)
	})

	it('removes the grid when the blade is disposed', () => {
		const { api, buttons } = setup()
		api.dispose()
		expect(api.element.isConnected).toBe(false)
		expect(buttons.some((button) => button.isConnected)).toBe(false)
	})
})
