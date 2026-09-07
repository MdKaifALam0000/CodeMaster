/**
 * TimelineEngine - Continuous real-time playback engine for algorithm animations
 * Maintains smooth, uninterrupted clock physics without freezing or stuttering.
 */
class TimelineEngine {
    constructor(timeline, onAction, onComplete, onTick) {
        this.timeline = timeline || [];
        this.onAction = onAction;
        this.onComplete = onComplete;
        this.onTick = onTick; // Called on every animation frame with (currentTime, progressPercent)

        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.startTime = null;
        this.pausedTime = 0;
        this.animationFrame = null;
        this.speed = 1;
    }

    /**
     * Start or resume playing the timeline continuously
     */
    play() {
        if (this.timeline.length === 0) return;

        this.isPlaying = true;
        this.isPaused = false;
        this.startTime = performance.now();
        this.tick();
    }

    /**
     * Pause the timeline cleanly without losing position
     */
    pause() {
        if (!this.isPlaying) return;

        this.pausedTime = this.getCurrentTime();
        this.isPaused = true;
        this.isPlaying = false;
        this.startTime = null;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Resume from paused state
     */
    resume() {
        if (!this.isPaused) return;
        this.play();
    }

    /**
     * Stop and reset to beginning
     */
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.pausedTime = 0;
        this.startTime = null;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Seek to a specific timestamp in seconds and replay visual state
     */
    seek(time) {
        const duration = this.getDuration();
        const clampedTime = Math.max(0, Math.min(time, duration));
        this.pausedTime = clampedTime;

        if (this.isPlaying) {
            this.startTime = performance.now();
        }

        // Find actions up to target time
        const targetIndex = this.timeline.findIndex(action => action.time > clampedTime);
        const endIdx = targetIndex === -1 ? this.timeline.length : targetIndex;

        // Replay all actions up to seek target to reconstruct visual state
        if (this.onAction) {
            for (let i = 0; i < endIdx; i++) {
                const action = this.timeline[i];
                this.onAction(action, action.time, true);
            }
        }

        this.currentIndex = endIdx;

        if (this.onTick) {
            this.onTick(clampedTime, this.getProgress());
        }
    }

    /**
     * Set playback speed (e.g. 0.5, 1, 1.5, 2)
     */
    setSpeed(speed) {
        if (this.isPlaying) {
            // Snapshot current time before updating speed factor
            this.pausedTime = this.getCurrentTime();
            this.startTime = performance.now();
        }
        this.speed = Math.max(0.25, Math.min(speed, 3.0));
    }

    /**
     * Get current playback time in seconds with sub-millisecond precision
     */
    getCurrentTime() {
        if (!this.isPlaying || !this.startTime) {
            return this.pausedTime;
        }
        const elapsed = ((performance.now() - this.startTime) / 1000) * this.speed;
        return this.pausedTime + elapsed;
    }

    /**
     * Get total duration of the timeline in seconds
     */
    getDuration() {
        if (this.timeline.length === 0) return 0;
        const lastAction = this.timeline[this.timeline.length - 1];
        return Math.max(1, (lastAction.time || 0) + (lastAction.duration || 1.5));
    }

    /**
     * Main animation loop running at 60/120 FPS
     */
    tick() {
        if (!this.isPlaying) return;

        const currentTime = this.getCurrentTime();
        const duration = this.getDuration();

        // Execute all actions scheduled up to the current timestamp
        while (
            this.isPlaying &&
            this.currentIndex < this.timeline.length &&
            this.timeline[this.currentIndex].time <= currentTime
        ) {
            const action = this.timeline[this.currentIndex];
            if (this.onAction) {
                this.onAction(action, currentTime, false);
            }
            this.currentIndex++;
        }

        // Notify tick listener with smooth progress
        if (this.onTick) {
            this.onTick(currentTime, this.getProgress());
        }

        // Check if animation reached the end
        if (currentTime >= duration && this.currentIndex >= this.timeline.length) {
            this.isPlaying = false;
            this.pausedTime = duration;
            if (this.onTick) {
                this.onTick(duration, 100);
            }
            if (this.onComplete) {
                this.onComplete();
            }
            return;
        }

        // Continue running uninterrupted
        this.animationFrame = requestAnimationFrame(() => this.tick());
    }

    /**
     * Get progress as a percentage (0-100)
     */
    getProgress() {
        const duration = this.getDuration();
        if (duration === 0) return 0;
        return Math.min(100, Math.max(0, (this.getCurrentTime() / duration) * 100));
    }
}

export default TimelineEngine;
