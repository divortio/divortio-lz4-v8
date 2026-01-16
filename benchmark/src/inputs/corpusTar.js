/**
 * benchmark/src/inputs/corpusTar.js
 * 
 * Represents a dynamically generated .tar file containing an entire corpus.
 * Spawns an external process to build the tarball to ensure isolation.
 */

import { InputFile } from './inputFile.js';
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// To validate existence before spawning?
import { CorpusCatalog } from '../corpus/catalog/corpusCatalog.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cleanup Handling
const cleanupFiles = new Set();
let cleanupRegistered = false;

function registerCleanup() {
    if (cleanupRegistered) return;
    cleanupRegistered = true;
    const cleanup = () => {
        for (const file of cleanupFiles) {
            try {
                if (fs.existsSync(file)) fs.unlinkSync(file);
            } catch (e) { }
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

export class CorpusTar extends InputFile {
    /**
     * @param {string} corpusName - Name of the corpus (e.g. 'silesia', 'lz_flex').
     */
    constructor(corpusName) {
        // 1. Resolve Corpus via Catalog
        const corpus = CorpusCatalog.get(corpusName);
        if (!corpus) {
            throw new Error(`Corpus not found: '${corpusName}'`);
        }

        // 2. Spawn Builder (Out of Process)
        // Builder is located at benchmark/src/corpus/shared/tarCorpus.js
        const builderScript = path.resolve(__dirname, '../corpus/shared/tarCorpus.js');
        const nodeExe = process.execPath;

        // console.log(`   [CorpusTar] Spawning builder for ${corpus.name}...`);

        let stdout;
        try {
            stdout = execFileSync(nodeExe, [builderScript, corpus.name], {
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'inherit'] // pipe stdout, inherit stderr
            });
        } catch (e) {
            throw new Error(`Failed to build corpus tar: ${e.message}`);
        }

        // 3. Parse Output
        let result;
        try {
            result = JSON.parse(stdout.trim());
        } catch (e) {
            throw new Error(`Invalid output from tarCorpus.js: ${stdout}`);
        }

        if (!result.path || !fs.existsSync(result.path)) {
            throw new Error(`Builder reported success but file missing: ${result.path}`);
        }

        // 4. Register Cleanup (We own it now)
        registerCleanup();
        cleanupFiles.add(result.path);

        // 5. Initialize InputFile
        // Path is absolute from builder
        // Name is <corpus>.tar
        super(result.path, `${corpus.name}.tar`);

        this.isTar = true;
        this.originalCorpusName = corpus.name;
    }
}
