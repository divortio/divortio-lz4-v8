import process from "process";

export class SystemRuntime {

    /**
     *
     * @type {string}
     */
    name = "Node.js";
    /**
     *
     * @type {string}
     */
    version = process.version;
    /**
     *
     * @type {string}
     */
    v8 = process.versions.v8;
    /**
     *
     * @type {number}
     */
    pid = process.pid;


    /**
     *
     * @type {"arm" | "arm64" | "ia32" | "loong64" | "mips" | "mipsel" | "ppc64" | "riscv64" | "s390x" | "x64"}
     */
    arch = process.arch;

    toString() {
        return `${this.name} ${this.version} (V8 ${this.v8})`
    }
}

export default {SystemRuntime};

