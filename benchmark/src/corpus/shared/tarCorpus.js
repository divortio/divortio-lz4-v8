/**
 * benchmark/src/build/tarCorpus.js
 * 
 * Logic to generate a temporary concatenated .tar file for a corpus on-demand.
 * Ensures the file is deleted upon process exit.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_ROOT = path.resolve(__dirname, '../../../.cache/corpus');

// Track files for cleanup
const cleanupFiles = new Set();
let cleanupRegistered = false;

function registerCleanup() {
    if (cleanupRegistered) return;
    cleanupRegistered = true;

    const cleanup = () => {
        if (cleanupFiles.size > 0) {
            console.log('\n🧹 Cleaning up temporary corpus files...');
            for (const file of cleanupFiles) {
                try {
                    if (fs.existsSync(file)) {
                        fs.unlinkSync(file);
                        // console.log(`   Deleted ${path.basename(file)}`);
                    }
                } catch (e) {
                    // Ignore errors during exit
                }
            }
            cleanupFiles.clear();
        }
    };

    process.on('exit', cleanup);
    process.on('SIGINT', () => { cleanup(); process.exit(130); });
    process.on('SIGTERM', () => { cleanup(); process.exit(143); });
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        cleanup();
        process.exit(1);
    });
}

/**
 * Creates a tarball of the specified corpus if it contains files.
 * @param {string} corpusName - Name of the corpus (e.g. 'silesia').
 * @returns {string} Absolute path to the created .tar file.
 */
export function createCorpusTar(corpusName) {
    // 1. Resolve Corpus Directory
    const corpusDir = path.join(CACHE_ROOT, corpusName);
    if (!fs.existsSync(corpusDir)) {
        throw new Error(`Corpus directory not found: ${corpusDir}`);
    }

    // 2. Define Output Path
    // stored as <corpus>/<corpus>.tar
    const tarPath = path.join(corpusDir, `${corpusName}.tar`);

    // 3. Check if we need to build
    // Although we prefer on-demand, if it exists from a previous crashed run, we overwrite or reuse?
    // User request: "generate the .tar file on-demand... cleanup the file on exit"
    // So we assume it should not persist. We will recreate it.

    if (fs.existsSync(tarPath)) {
        try {
            fs.unlinkSync(tarPath);
        } catch (e) {
            // ignore
        }
    }

    // Register cleanup for THIS process (in case we crash during build)
    registerCleanup();
    cleanupFiles.add(tarPath);

    console.error(`📦 Generating temporary tarball: ${corpusName}.tar ...`); // Stderr for logs

    // 5. Build Tar Command
    try {
        // macOS tar (bsdtar) and GNU tar support --exclude.
        // We'll run command in cwd = corpusDir
        execSync(`tar --exclude="${path.basename(tarPath)}" -cf "${path.basename(tarPath)}" *`, {
            cwd: corpusDir,
            stdio: 'ignore' // Suppress output
        });

    } catch (e) {
        throw new Error(`Failed to create tarball for ${corpusName}: ${e.message}`);
    }

    if (!fs.existsSync(tarPath)) {
        throw new Error(`Tarball creation failed (file missing): ${tarPath}`);
    }

    const size = fs.statSync(tarPath).size;

    // NOTE: We do NOT remove from cleanupFiles here. 
    // If used as a library, the caller might want it cleaned up on exit.
    // If used as CLI, the CLI block will remove it from cleanupFiles before exiting 0.

    return tarPath;
}

// CLI Entry Point
if (process.argv[1] === __filename) {
    const corpusName = process.argv[2];
    if (!corpusName) {
        console.error('Usage: node tarCorpus.js <corpusName>');
        process.exit(1);
    }

    try {
        const tarPath = createCorpusTar(corpusName);
        const size = fs.statSync(tarPath).size;

        // Success! We output JSON to stdout.
        // AND we must ensure we don't delete it when WE exit.
        cleanupFiles.delete(tarPath);

        console.log(JSON.stringify({ path: tarPath, size: size }));
        process.exit(0);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
