import { BaseLib } from "./baseLib.js";

export class BenchLib {

    /**
     * @param {BaseLib} libClass
     */
    constructor(libClass) {
        this.name = libClass.name;
        this.package = libClass.package;
        this.environment = libClass.environment;
        this.language = libClass.language;
        this.class = libClass;
    }
}

export default { BenchLib };