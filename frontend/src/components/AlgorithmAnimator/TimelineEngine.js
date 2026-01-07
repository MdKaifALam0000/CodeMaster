/**
 * Timeline Engine - Controls animation playback based on timeline JSON
 */
class TimelineEngine {
    constructor(timeline, onAction, onComplete) {
        this.timeline = timeline || [];
        this.onAction = onAction;
        this.onComplete = onComplete;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.startTime = null;
        this.pausedTime = 0;
        this.animationFrame = null;
        this.speed = 1;
    }

    /**
     * Start playing the timeline from the beginning
     */
    play() {
        if (this.timeline.length === 0) return;

        this.isPlaying = true;
        this.isPaused = false;
        this.startTime = performance.now() - (this.pausedTime * 1000);
        this.tick();
    }

    /**
     * Pause the timeline
     */
    pause() {
        if (!this.isPlaying) return;

        this.isPaused = true;
        this.isPlaying = false;
        this.pausedTime = (performance.now() - this.startTime) / 1000;

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
     * Seek to a specific time in seconds
     */
    seek(time) {
        this.pausedTime = time;
        this.currentIndex = 0;

        // Find the correct index for this time
        for (let i = 0; i < this.timeline.length; i++) {
            if (this.timeline[i].time <= time) {
                this.currentIndex = i + 1;
            } else {
                break;
            }
        }

        if (this.isPlaying) {
            this.startTime = performance.now() - (time * 1000);
        }
    }

    /**
     * Set playback speed (1 = normal, 0.5 = half, 2 = double)
     */
    setSpeed(speed) {
        const currentTime = this.getCurrentTime();
        this.speed = speed;
        if (this.isPlaying) {
            this.startTime = performance.now() - (currentTime * 1000 / this.speed);
        }
    }

    /**
     * Get current playback time in seconds
     */
    getCurrentTime() {
        if (!this.startTime) return this.pausedTime;
        return ((performance.now() - this.startTime) / 1000) * this.speed;
    }

    /**
     * Get total duration of the timeline
     */
    getDuration() {
        if (this.timeline.length === 0) return 0;
        const lastAction = this.timeline[this.timeline.length - 1];
        return lastAction.time + (lastAction.duration || 1);
    }

    /**
     * Main animation loop
     */
    tick() {
        if (!this.isPlaying) return;

        const currentTime = this.getCurrentTime();

        // Execute all actions up to current time
        while (
            this.currentIndex < this.timeline.length &&
            this.timeline[this.currentIndex].time <= currentTime
        ) {
            const action = this.timeline[this.currentIndex];
            if (this.onAction) {
                this.onAction(action, currentTime);
            }
            this.currentIndex++;
        }

        // Check if we've reached the end
        if (this.currentIndex >= this.timeline.length) {
            const duration = this.getDuration();
            if (currentTime >= duration) {
                this.isPlaying = false;
                if (this.onComplete) {
                    this.onComplete();
                }
                return;
            }
        }

        // Continue the animation loop
        this.animationFrame = requestAnimationFrame(() => this.tick());
    }

    /**
     * Get progress as a percentage (0-100)
     */
    getProgress() {
        const duration = this.getDuration();
        if (duration === 0) return 0;
        return Math.min(100, (this.getCurrentTime() / duration) * 100);
    }
}

export default TimelineEngine;
