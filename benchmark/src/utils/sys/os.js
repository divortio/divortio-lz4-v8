import os from 'benchmark/src/utils/sys/os.js'

export class SystemOS {


    /**
     *
     * @type {"aix" | "android" | "darwin" | "freebsd" | "haiku" | "linux" | "openbsd" | "sunos" | "win32" | "cygwin" | "netbsd"}
     */
    platform = os.platform();
    /**
     *
     * @type {string}
     */
    type = os.type();
    /**
     *
     * @type {string}
     */
    version = os.version();
    /**
     *
     * @type {string}
     */
    release = os.release();

    /**
     *
     * @type {"arm" | "arm64" | "ia32" | "loong64" | "mips" | "mipsel" | "ppc64" | "riscv64" | "s390x" | "x64"}
     */
    arch = os.arch();

    toString() {
        return `${this.platform} ${this.release} ( ${this.arch})`
    }
}

export default {SystemOS}