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



test('Run All Tests (Bench + Profile)', async (t) => {
    console.log('Starting Benchmark Tests...');
    await import('./runAll.bench.test.js');

    console.log('Starting Profile Tests...');
    await import('./runAll.profile.test.js');
});
