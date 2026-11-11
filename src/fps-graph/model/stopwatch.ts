type Timestamp = {
	frameCount: number
	time: number
}

const MAX_TIMESTAMPS = 20

export class Fpswatch {
	get duration(): number {
		return this.duration_
	}
	get fps(): null | number {
		return this.fps_
	}
	private duration_ = 0
	private fps_: null | number = null
	private frameCount_ = 0

	private start_: null | number = null

	private readonly timestamps_: Timestamp[] = []

	public begin(now: Date): void {
		this.start_ = now.getTime()
	}

	public end(now: Date): void {
		if (this.start_ === null) {
			return
		}

		const t = now.getTime()
		this.duration_ = t - this.start_
		this.start_ = null

		this.fps_ = this.calculateFps_(t)

		this.timestamps_.push({
			frameCount: this.frameCount_,
			time: t,
		})
		++this.frameCount_

		this.compactTimestamps_()
	}

	private calculateFps_(nowTime: number): null | number {
		const ts = this.timestamps_[0]
		return ts === undefined
			? null
			: (1000 * (this.frameCount_ - ts.frameCount)) / (nowTime - ts.time)
	}

	private compactTimestamps_(): void {
		if (this.timestamps_.length <= MAX_TIMESTAMPS) {
			return
		}

		this.timestamps_.splice(0, this.timestamps_.length - MAX_TIMESTAMPS)

		const df = this.timestamps_[0]?.frameCount ?? 0
		for (const ts of this.timestamps_) {
			ts.frameCount -= df
		}

		this.frameCount_ -= df
	}
}
