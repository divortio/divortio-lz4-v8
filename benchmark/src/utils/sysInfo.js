
import {SystemOS} from "./sys/os.js";
import {SystemCPU} from "./sys/cpu.js";
import {SystemMemory} from "./sys/memory.js";
import {SystemRuntime} from "./sys/runtime.js";
import {toISOStrTZ} from "./dateTime.js";

export class SystemInfo {

    /**
     *
     * @type {Date}
     */
    dateTime = new Date();
    /**
     *
     * @type {SystemOS}
     */
    os = new SystemOS();
    /**
     *
     * @type {SystemCPU}
     */
    cpu = new SystemCPU();
    /**
     *
     * @type {SystemMemory}
     */
    memory = new SystemMemory();
    /**
     *
     * @type {SystemRuntime}
     */
    runtime = new SystemRuntime();


    /**
     * @method toConsole
     */
    toConsole() {
        const sysStr = this.toString();
        console.log(`\n================================================================================`);
        console.log(`ENVIRONMENT`);
        console.log(`Date: ${toISOStrTZ(new Date())}`);
        console.log(`================================================================================`);
        console.log(`Runtime:   ${sysStr.runtime}`);
        console.log(`OS:        ${sysStr.os}`);
        console.log(`CPU:       ${sysStr.cpu}`);
        console.log(`Memory:    ${sysStr.memory}`);
        console.log(`================================================================================`);
    }

    /**
     * @method toString
     * @returns {{dateTime: string, cpu: string, memory: string, os: string, runtime: string}}
     */
    toString() {
        return {
            dateTime: toISOStrTZ(this.dateTime),
            cpu: this.cpu.toString(),
            memory: this.memory.toString(),
            os: this.os.toString(),
            runtime: this.runtime.toString()
        }
    }


    /**
     * @method toJSON
     * @param spaces {number}
     * @return {string}
     */
    toJSON(spaces=2) {
        return JSON.stringify(this.toString(), null, spaces);
    }

}

export default {SystemInfo};
