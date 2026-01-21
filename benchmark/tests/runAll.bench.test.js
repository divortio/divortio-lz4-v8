/**
 * benchmark/tests/runAll.bench.test.js
 * 
 * Executes ONLY benchmark tests (excluding profile tests).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Recursive find .test.js
function findTests(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    for (const file of list) {
        if (file.startsWith('runAll')) continue; // Skip runners
        if (file === 'utils') continue; // Skip utils

        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(findTests(filePath));
        } else if (file.endsWith('.test.js') && !file.includes('profile.')) {
            // Include *.test.js but EXCLUDE profile.*.test.js
            results.push(filePath);
        }
    }
    return results;
}

const testFiles = findTests(__dirname);

test('Run All Bench Tests', async (t) => {
    console.log(`Found ${testFiles.length} benchmark test files.`);

    for (const file of testFiles) {
        console.log(`Loading ${path.relative(__dirname, file)}...`);
        await import(file);
    }
});
