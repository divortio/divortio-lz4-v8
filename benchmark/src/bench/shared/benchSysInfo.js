/**
 * benchmark/src/bench/shared/benchSysInfo.js
 * 
 * Captures system information for benchmark reporting.
 */

import { getSystemInfo } from '../../utils/sysInfo.js';

export class BenchSysInfo {
    constructor() {
        this.data = null;
        this.timestamp = null;
    }

    /**
     * Captures the current system state.
     * @returns {BenchSysInfo} self
     */
    capture() {
        this.data = getSystemInfo();
        this.timestamp = new Date();
        return this;
    }

    /**
     * @returns {object}
     */
    toJSON() {
        return {
            timestamp: this.timestamp,
            system: this.data
        };
    }

    /**
     * @param {object} json 
     * @returns {BenchSysInfo}
     */
    static fromJSON(json) {
        const instance = new BenchSysInfo();
        instance.data = json.system;
        instance.timestamp = new Date(json.timestamp);
        return instance;
    }
}
