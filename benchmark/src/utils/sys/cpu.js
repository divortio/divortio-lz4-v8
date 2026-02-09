import os from 'os';

/**
 *
 * @param model {string}
 * @returns {string}
 */
const  cleanCpuModel = function(model) {
    return model
        // 1. Remove (R), (TM), ®, and ™
        .replace(/\((R|TM)\)|®|™/gi, '')
        // 2. Remove "@ 2.50GHz" suffix common in Intel strings
        .replace(/\s+@\s+\d+(\.\d+)?\s*(GHz|MHz)/gi, '')
        // 3. Remove generic descriptors like "CPU", "Processor", or "16-Core"
        .replace(/\b(CPU|Processor|\d+-Core)\b/gi, '')
        // 4. Clean up multiple spaces and trim ends
        .replace(/\s+/g, ' ')
        .trim();
}


export class SystemCPU {

    /**
     * @type {string}
     */
    model;
    /**
     * @type {number}
     */
    cores;
    /**
     * @type {number}
     */
    mhz;
    /**
     * @type {number}
     */
    ghz;

    /**
     * @type {string}
     */
    arch;

    constructor(cpus= os.cpus()) {
        /**
         *
         * @type {string}
         */
        this.model =  cpus.length > 0 ? cleanCpuModel(cpus[0].model) : 'Unknown';
        /**
         *
         * @type {number}
         */
        this.cores =  cpus.length | 0;
        /**
         *
         * @type {number}
         */
        this.mhz =  (cpus.length > 0 ? cpus[0].speed : 0) | 0;
        /**
         *
         * @type {number}
         */
        this.ghz = (cpus.length > 0 ?  Math.round((os.cpus()[0].speed / 1000) * 10 ) / 10  : 0) | 0;

        /**
         * @type {string}
         */
        this.arch = os.arch();
    }

    /**
     *
     * @returns {string}
     */
    toString() {
        return `${this.model} (${this.cores} Cores)`;
    }

}

export default {SystemCPU}