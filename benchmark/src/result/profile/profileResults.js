/**
 * benchmark/src/result/profile/profileResults.js
 * 
 * Container for profile results.
 */

export class ProfileResults {
    constructor(config) {
        this.config = config;
        this.startTime = new Date();
        this.results = [];
    }

    addResult(result) {
        this.results.push(result);
    }

    setEndTime() {
        this.endTime = new Date();
    }

    toJSON() {
        const endTime = this.endTime || new Date();
        const durationMs = endTime - this.startTime;
        const durationH = `${(durationMs / 1000).toFixed(2)}s`;

        return {
            meta: {
                startTime: this.startTime,
                endTime: endTime,
                timestamp: this.startTime.toISOString(),
                duration: durationMs,
                durationH: durationH
            },
            config: this.config.toJSON(),
            results: this.results.map(r => r.toJSON())
        };
    }
}
