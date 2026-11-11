import { Pane } from 'tweakpane'
import { afterEach, describe, expect, it } from 'vitest'
import * as plugin from '../src/index'

const VIEW_SELECTORS = [
	'.tp-btngridv',
	'.tp-cbzv',
	'.tp-cbzgv',
	'.tp-cbzprvv',
	'.tp-fpsv',
	'.tp-radgridv',
	'.tp-radv',
	'.tp-rslv',
	'.tp-rsltxtv',
]

describe('essentials plugin bundle', () => {
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
	})

	function setup() {
		pane = new Pane()
		pane.registerPlugin(plugin)
		return { pane }
	}

	it('bundles every blade and input plugin under one id', () => {
		expect(plugin.id).toBe('essentials')
		expect(plugin.plugins.map((p) => `${p.type}:${p.id}`)).toEqual([
			'blade:buttongrid',
			'blade:cubicbezier',
			'blade:fpsgraph',
			'input:input-interval',
			'blade:radiogrid',
			'input:input-radiogrid',
			'input:input-radiogrid',
			'input:input-radiogrid',
		])
	})

	it('installs compiled styles for every plugin view', () => {
		setup()
		expect(plugin.css).not.toContain('@use')
		for (const selector of VIEW_SELECTORS) {
			expect(plugin.css).toContain(selector)
			expect(document.head.textContent).toContain(selector)
		}
	})

	it('creates every view through the registered plugins', () => {
		const { pane: currentPane } = setup()
		const elements = [
			currentPane.addBlade({ cells: () => ({ title: 'A' }), size: [1, 1], view: 'buttongrid' }),
			currentPane.addBlade({ value: [0, 0, 1, 1], view: 'cubicbezier' }),
			currentPane.addBlade({ view: 'fpsgraph' }),
			currentPane.addBinding({ range: { min: 0, max: 1 } }, 'range'),
			currentPane.addBlade({
				cells: () => ({ title: 'A', value: 'a' }),
				groupName: 'bundle-blade',
				size: [1, 1],
				value: 'a',
				view: 'radiogrid',
			}),
			currentPane.addBinding({ choice: 'a' }, 'choice', {
				cells: () => ({ title: 'A', value: 'a' }),
				groupName: 'bundle-input',
				size: [1, 1],
				view: 'radiogrid',
			}),
		].map((api) => api.element)

		expect(elements.map((element) => element.isConnected)).toEqual(elements.map(() => true))
		expect(elements[0]?.querySelector('.tp-btngridv')).not.toBeNull()
		expect(elements[1]?.querySelector('.tp-cbzv')).not.toBeNull()
		expect(elements[2]?.querySelector('.tp-fpsv')).not.toBeNull()
		expect(elements[3]?.querySelector('input')).not.toBeNull()
		expect(elements[4]?.querySelector('.tp-radgridv')).not.toBeNull()
		expect(elements[5]?.querySelector('.tp-radgridv')).not.toBeNull()
	})
})
