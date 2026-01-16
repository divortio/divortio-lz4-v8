/**
 * benchmark/tests/runAll.test.js
 * 
 * Executes all tests within the subdirectories.
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
        if (file === 'runAll.test.js') continue; // Skip self
        if (file === 'utils') continue; // Skip utils

        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(findTests(filePath));
        } else if (file.endsWith('.test.js')) {
            results.push(filePath);
        }
    }
    return results;
}

const testFiles = findTests(__dirname);

test('Run All CLI Tests', async (t) => {
    console.log(`Found ${testFiles.length} test files.`);

    for (const file of testFiles) {
        // Dynamic import executes the test file
        // node:test registers tests automatically upon import
        console.log(`Loading ${path.relative(__dirname, file)}...`);
        await import(file);
    }
});
