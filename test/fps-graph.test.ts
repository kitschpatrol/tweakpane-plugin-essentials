import { Pane } from 'tweakpane'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FpsGraphBladeApi } from '../src/index'
import { FpsGraphBladePlugin } from '../src/fps-graph/plugin'
import * as plugin from '../src/index'
import { Fpswatch } from '../src/index'

/**
 * Runs frames that each take 5 ms and start `period` ms apart, and returns the
 * next start time.
 */
function runFrames(watch: Fpswatch, count: number, period: number, start: number): number {
	let time = start
	for (let i = 0; i < count; i++) {
		watch.begin(new Date(time))
		watch.end(new Date(time + 5))
		time += period
	}

	return time
}

describe(Fpswatch.name, () => {
	it('reports no fps until a second frame ends', () => {
		const watch = new Fpswatch()
		expect(watch.fps).toBeNull()
		runFrames(watch, 1, 20, 0)
		expect(watch.fps).toBeNull()
		runFrames(watch, 1, 20, 20)
		expect(watch.fps).toBeCloseTo(50)
	})

	it('measures the duration of the last frame', () => {
		const watch = new Fpswatch()
		watch.begin(new Date(1000))
		watch.end(new Date(1012))
		expect(watch.duration).toBe(12)
	})

	it('ignores an end without a matching begin', () => {
		const watch = new Fpswatch()
		runFrames(watch, 2, 20, 0)
		watch.end(new Date(1000))
		expect(watch.fps).toBeCloseTo(50)
		expect(watch.duration).toBe(5)
	})

	it('averages over only the most recent frames', () => {
		const watch = new Fpswatch()
		const time = runFrames(watch, 30, 20, 0)
		expect(watch.fps).toBeCloseTo(50)
		runFrames(watch, 25, 10, time)
		expect(watch.fps).toBeCloseTo(100)
	})
})

describe('fps graph blade plugin', () => {
	let pane: Pane | undefined

	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		pane?.dispose()
		vi.useRealTimers()
	})

	function setup(params: Record<string, unknown> = {}) {
		pane = new Pane()
		pane.registerPlugin(plugin)
		const api = pane.addBlade({ label: 'FPS', view: 'fpsgraph', ...params }) as FpsGraphBladeApi
		const valueElement = api.element.querySelector('.tp-fpsv_v')
		const ticks: number[] = []
		api.on('tick', () => {
			ticks.push(Date.now())
		})
		return { api, ticks, valueElement }
	}

	function renderFrames(api: FpsGraphBladeApi, count: number): void {
		for (let i = 0; i < count; i++) {
			api.begin()
			vi.advanceTimersByTime(5)
			api.end()
			vi.advanceTimersByTime(15)
		}
	}

	it('accepts only valid fps graph params', () => {
		expect(FpsGraphBladePlugin.accept({ view: 'fpsgraph' })).not.toBeNull()
		expect(
			FpsGraphBladePlugin.accept({ interval: 100, max: 60, min: 0, rows: 3, view: 'fpsgraph' }),
		).not.toBeNull()
		expect(FpsGraphBladePlugin.accept({ view: 'graph' })).toBeNull()
		expect(FpsGraphBladePlugin.accept({ interval: '100', view: 'fpsgraph' })).toBeNull()
		expect(FpsGraphBladePlugin.accept({ rows: 'two', view: 'fpsgraph' })).toBeNull()
	})

	it('shows a placeholder until frames are measured', () => {
		const { api, valueElement } = setup()
		expect(api.fps).toBeNull()
		vi.advanceTimersByTime(500)
		expect(valueElement?.textContent).toBe('--')
	})

	it('measures frames between begin and end and shows fps on each tick', () => {
		const { api, ticks, valueElement } = setup()
		renderFrames(api, 10)
		expect(api.fps).toBeCloseTo(50)
		expect(ticks).toEqual([])
		vi.advanceTimersByTime(300)
		expect(ticks).toHaveLength(1)
		expect(valueElement?.textContent).toBe('50')
	})

	it('ticks at the requested interval', () => {
		const { ticks } = setup({ interval: 100 })
		vi.advanceTimersByTime(350)
		expect(ticks).toHaveLength(3)
	})

	it('never ticks with a zero interval', () => {
		const { ticks } = setup({ interval: 0 })
		vi.advanceTimersByTime(1000)
		expect(ticks).toEqual([])
	})

	it('exposes the graph range', () => {
		const { api } = setup({ max: 120 })
		expect(api.min).toBe(0)
		expect(api.max).toBe(120)
		api.min = 10
		api.max = 60
		expect(api.min).toBe(10)
		expect(api.max).toBe(60)
	})

	it('stops ticking when disposed', () => {
		const { api, ticks } = setup()
		api.dispose()
		vi.advanceTimersByTime(2000)
		expect(ticks).toEqual([])
		expect(api.element.isConnected).toBe(false)
	})
})
