
import { join } from 'path';
import { pathToFileURL } from 'url';

/**
 * @fileoverview
 * Test Runner for LZ4-Divortio
 * ============================================================================
 * Discovers and executes all `.test.js` files within the `tests/` directory.
 * Uses Node.js native test runner (`node:test`) by dynamically importing test files.
 *
 * @usage
 * ```bash
 * node tests/runALL.test.js
 * ```
 */

/**
 * Recursively walks a directory yielding all matching test files.
 * @param {string} dir - Directory to walk.
 * @returns {AsyncGenerator<string>} Absolute paths to test files.
 */
async function* walk(dir) {
    const fs = await import('fs/promises');
    let dirents;
    try {
        dirents = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
        console.error(`Error reading directory ${dir}:`, err);
        return;
    }

    for (const dirent of dirents) {
        const res = join(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* walk(res);
        } else {
            // Match .test.js but exclude this runner itself to avoid recursion/loops if mistakenly matched
            if (res.endsWith('.test.js') && !res.endsWith('runALL.test.js')) {
                yield res;
            }
        }
    }
}

// Main Execution
(async () => {
    const cwd = process.cwd();
    // Allow optional argument to filter specific directory (e.g. node tests/runALL.test.js tests/reference/)
    const targetDir = process.argv[2] ? join(cwd, process.argv[2]) : join(cwd, 'tests');

    console.log('Running tests in:', targetDir);
    console.log('---------------------------------------------------');

    let count = 0;
    const start = performance.now();

    try {
        for await (const file of walk(targetDir)) {
            // Import runs the test because node:test registers them immediately
            await import(pathToFileURL(file).href);
            count++;
        }
    } catch (err) {
        console.error('Fatal Error during test discovery/import:', err);
        process.exit(1);
    }

    const duration = (performance.now() - start).toFixed(2);
    console.log('---------------------------------------------------');
    console.log(`Loaded ${count} test suites in ${duration}ms.`);
    console.log('Waiting for test completion...');
    // node:test will output results automatically
})();
