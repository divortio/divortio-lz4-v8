/**
 * benchmark/src/report/dsv/dsvSysInfo.js
 */

import { generateDSV } from './dsvBase.js';

export function generateSysInfoDSV(sysInfo, options = {}) {
    if (!sysInfo || !sysInfo.data) return '';

    // Flatten nested object
    const flat = flattenObject(sysInfo.data);
    const keys = Object.keys(flat);
    const columns = keys.map(k => ({ header: k, key: k }));

    return generateDSV([flat], columns, options);
}

function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !(obj[k] instanceof Date) && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
}
