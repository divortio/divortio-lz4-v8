/**
 * benchmark/src/corpus/benchCorpus.js
 * 
 * Entry point for Corpus CLI operations.
 * Handles listing, caching, and validating corpora.
 */

import { CorpusCatalog } from './catalog/corpusCatalog.js';
import { humanFileSize } from '../utils/sysInfo.js'; // Assuming utility exists or I should reimplement helper

function printTable(rows) {
    if (rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const widths = keys.map(k => Math.max(k.length, ...rows.map(r => String(r[k]).length)));

    // Header
    console.log(keys.map((k, i) => k.padEnd(widths[i])).join(' | '));
    console.log(widths.map(w => '-'.repeat(w)).join('-|-'));

    // Rows
    rows.forEach(row => {
        console.log(keys.map((k, i) => String(row[k]).padEnd(widths[i])).join(' | '));
    });
}

/**
 * Lists available corpora and their files.
 * @param {object} options
 * @param {string} [options.filter] - Filter by corpus name
 */
export async function list(options = {}) {
    const filter = options.filter ? options.filter.toLowerCase() : null;
    const all = CorpusCatalog.getAll();

    for (const corpus of all) {
        if (filter && !corpus.name.includes(filter)) continue;

        const exists = corpus.exists();
        const statusIcon = exists ? '✅' : '❌';
        console.log(`\n${statusIcon} Corpus: ${corpus.name}`);
        console.log(`   Description: ${corpus.description}`);
        console.log(`   Source: ${corpus.url}`);

        if (exists) {
            const files = corpus.files; // getter
            const tableData = files.map(f => ({
                Filename: f.name,
                Size: f.size + " B", // Simple formatting
                Path: f.path
            }));
            printTable(tableData);
        } else {
            console.log(`   (Not cached. Run 'bench.js corpus cache ${corpus.name}' to download)`);
            // List expected files from manifest
            const manifest = corpus.fileManifest.map(f => ({
                Filename: f.filename,
                Size: f.size // + " B"
            }));
            console.log("   Expected Files:");
            console.table(manifest);
        }
    }
}

/**
 * Caches (downloads) a corpus.
 * @param {string} name 
 */
export async function cache(name) {
    const corpus = CorpusCatalog.get(name);
    if (!corpus) {
        console.error(`Corpus '${name}' not found.`);
        return;
    }

    try {
        await corpus.cache();
        console.log(`\nSuccessfully cached '${corpus.name}'.`);
    } catch (e) {
        console.error(`\nFailed to cache '${corpus.name}': ${e.message}`);
        process.exit(1);
    }
}

export const BenchCorpus = {
    list,
    cache,
    Catalog: CorpusCatalog
};
