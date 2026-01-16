import os from 'os';
import process from 'process';

/**
 *
 * @returns {{model: string, cores: number, speed: *, arch: NodeJS.Architecture}}
 */
export function getCPU() {
    const cpus = os.cpus();
    const firstCpu = cpus.length > 0 ? cpus[0] : { model: 'Unknown', speed: 0 };
    return {
        model: firstCpu.model.trim(),
        cores: cpus.length,
        speed: firstCpu.speed,
        arch: os.arch()
    };
}

/**
 *
 * @returns {{totalBytes: number, freeBytes: number, totalGB: number}}
 */
export function getMemory() {
    const total = os.totalmem();
    return {
        totalBytes: total,
        freeBytes: os.freemem(),
        totalGB: parseFloat((total / 1024 / 1024 / 1024).toFixed(2))
    };
}

/**
 *
 * @returns {{platform: string, type: NodeJS.Platform, release: string, hostname: string}}
 */
export function getOS() {
    return {
        platform: os.type(), // e.g. 'Darwin', 'Linux'
        type: os.platform(), // e.g. 'darwin', 'linux'
        release: os.release()
    };
}

/**
 *
 * @returns {{name: string, version: string, v8: string, pid: number}}
 */
export function getRuntime() {
    return {
        name: 'Node.js',
        version: process.version,
        v8: process.versions.v8,
        pid: process.pid
    };
}

/**
 *
 * @returns {{cpu: {model: string, cores: number, speed: *, arch: NodeJS.Architecture}, memory: {totalBytes: number, freeBytes: number, totalGB: number}, os: {platform: string, type: NodeJS.Platform, release: string, hostname: string}, runtime: {name: string, version: string, v8: string, pid: number}}}
 */
export function getSystemInfo() {
    return {
        cpu: getCPU(),
        memory: getMemory(),
        os: getOS(),
        runtime: getRuntime()
    };
}

/**
 *
 * @returns {{cpu: string, memory: string, os: string, runtime: string}}
 */
export function getSystemInfoStr() {
    const sys = getSystemInfo();
    return {
        cpu: `${sys.cpu.model} (${sys.cpu.cores} Cores)`,
        memory: `${sys.memory.totalGB} GB`,
        os: `${sys.os.platform} ${sys.os.release} (${sys.cpu.arch})`,
        runtime: `${sys.runtime.name} ${sys.runtime.version} (V8 ${sys.runtime.v8})`
    };
}

/**
 *
 */
export function printSystemInfo() {
    const sysStr = getSystemInfoStr();
    console.log(`\n================================================================================`);
    console.log(`⚡ BENCHMARK ENVIRONMENT`);
    console.log(`================================================================================`);
    console.log(`Runtime:   ${sysStr.runtime}`);
    console.log(`OS:        ${sysStr.os}`);
    console.log(`CPU:       ${sysStr.cpu}`);
    console.log(`Memory:    ${sysStr.memory}`);
    console.log(`================================================================================`);
}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
export function humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
}