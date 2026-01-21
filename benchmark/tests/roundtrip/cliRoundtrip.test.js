/**
 * benchmark/tests/roundtrip/cliRoundtrip.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { runBench, TEST_CACHE_DIR } from '../utils/testUtils.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_FILE = path.join(__dirname, 'test_input.txt');

test('CLI Roundtrip Command', async (t) => {

    t.before(() => {
        fs.writeFileSync(TEMP_FILE, 'Hello World '.repeat(100));
    });

    t.after(() => {
        if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    });

    await t.test('roundtrip local file', () => {
        const outputDir = path.join(TEST_CACHE_DIR, 'roundtrip');
        fs.mkdirSync(outputDir, { recursive: true });

        // Output detailed JSON to output directory
        const result = runBench(['roundtrip', '-l', 'lz4Divortio', '-i', TEMP_FILE, '-s', '1', '-w', '0', '-f', 'json', '--dir', outputDir]);

        assert.strictEqual(result.exitCode, 0, `Failed: ${result.stderr}`);

        // Find the generated JSON file
        const files = fs.readdirSync(outputDir);
        const jsonFile = files.find(f => f.startsWith('rndt_') && f.endsWith('.json'));

        assert.ok(jsonFile, 'Should generate a JSON report file');

        const jsonPath = path.join(outputDir, jsonFile);
        try {
            const content = fs.readFileSync(jsonPath, 'utf8');
            const data = JSON.parse(content);

            // Check content (BenchResults structure)
            assert.ok(data.results, 'Should have results');
            assert.ok(data.system, 'Should have system info');
            assert.ok(data.config, 'Should have config');

            // Cleanup
            fs.rmSync(outputDir, { recursive: true, force: true });
        } catch (e) {
            assert.fail(`JSON file invalid: ${e.message}`);
        }
    });
});
