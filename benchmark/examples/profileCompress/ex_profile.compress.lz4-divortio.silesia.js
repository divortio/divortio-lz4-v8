/**
 * benchmark/examples/profileCompress/ex_profile.compress.lz4-divortio.silesia.js
 * 
 * Example of running a profile via child_process spawn in Node.js.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const benchCLI = path.resolve(__dirname, '../../../bench.js');

console.log('Starting Profile...');

const args = [
    'profile', 'compress',
    '-l', 'lz4Divortio',
    '-c', 'silesia',
    '-s', '5',
    '-w', '2'
];

const result = spawnSync(process.execPath, [benchCLI, ...args], {
    stdio: 'inherit',
    encoding: 'utf8'
});

if (result.error) throw result.error;
if (result.status !== 0) {
    console.error('Profile failed with exit code:', result.status);
    process.exit(1);
}

console.log('Done.');
