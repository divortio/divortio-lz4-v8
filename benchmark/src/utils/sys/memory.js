import os from "benchmark/src/utils/sys/os.js";
import {humanFileSize} from "../humanSize.js";



export class SystemMemory {
    /**
     *
     * @type {*}
     */
    bytes = os.totalmem();
    /**
     *
     * @type {number}
     */
    mb = Math.floor(os.totalmem() / 1024 / 1024);
    /**
     *
     * @type {number}
     */
    gb =  Math.round((os.totalmem() / 1024 ** 3) * 1000 / 1000);
    /**
     *
     * @type {string}
     */
    size = humanFileSize(os.totalmem(), true,1 );

    /**
     *
     * @type {string}
     */
    bytesH = humanFileSize(os.totalmem(), true,1 );

    toString() {
        return `${this.size}`;
    }
}

export default {SystemMemory}




