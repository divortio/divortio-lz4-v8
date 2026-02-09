/**
 * benchmark/src/report/dsv/dsvConfig.js
 */

import { generateDSV } from './dsvBase.js';

export function generateConfigDSV(config, options = {}) {
    if (!config) return '';

    // Flatten config for one wide row
    const row = {
        samples: config.samples,
        warmups: config.warmups,
        libraries: config.libs.getNames().join('|'), // Using different separator within field?
        inputs: config.inputs.getFileNames().join('|'),
        ...config.options
    };

    // Define columns dynamically based on keys, or fixed?
    // Dynamic is flexible for options args.
    const keys = Object.keys(row);
    const columns = keys.map(k => ({ header: k, key: k }));

    return generateDSV([row], columns, options);
}
