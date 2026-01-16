/**
 * benchmark/src/corpus/catalog/corpusLzFlex.js
 * 
 * Class definition for the lz_flex Corpus.
 */

import { BaseCorpus } from '../shared/baseCorpus.js';
import { downloadFile } from '../shared/cacheCorpus.js';
import path from 'path';
import fs from 'fs';

// Constants from corpus.lz_flex.js
export const LZ_FLEX_META = {
    name: 'lz_flex',
    url: 'https://raw.githubusercontent.com/m-ou-se/lz-flex/master/benchmark_data/',
    description: 'A set of files used by lz-flex for benchmarking.',
    buildFile: 'cacheCorpus.lz_flex.js',
    files: [
        { filename: 'dickens', size: 10192446 }, // Shared with Silesia? Name collision if flattened. 
        // But BaseCorpus isolates by directory (cacheDir/name).
        { filename: 'mozilla', size: 51220480 },
        { filename: 'mr', size: 9970564 },
        { filename: 'nci', size: 33553445 },
        { filename: 'ooffice', size: 6152192 },
        { filename: 'osdb', size: 10085684 },
        { filename: 'reymont', size: 6627202 },
        { filename: 'samba', size: 21606400 },
        { filename: 'sao', size: 7251944 },
        { filename: 'webster', size: 41458703 },
        { filename: 'x-ray', size: 8474240 },
        { filename: 'xml', size: 5345280 }
    ]
};
// Wait, lz_flex usually shares silesia files? 
// The metadata I copied from previous `corpus.lz_flex.js` (Step 2588) had exact same files.
// Does lz_flex repo just point to silesia? Or use same files?
// The URL is different: `https://raw.githubusercontent.com/m-ou-se/lz-flex/master/benchmark_data/`.
// This implies it downloads individual files from there.

export class CorpusLzFlex extends BaseCorpus {
    constructor() {
        super(LZ_FLEX_META);
    }

    async cache() {
        // Individual file strategy
        console.log(`Building ${this.name} corpus...`);

        // Ensure directory
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }

        for (const fileMeta of this.fileManifest) {
            const filePath = path.join(this.cacheDir, fileMeta.filename);

            // Check if exists
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.size > 0) continue; // Skip
            }

            const fileUrl = this.url + fileMeta.filename;
            try {
                await downloadFile(fileUrl, filePath);
            } catch (e) {
                console.error(`❌ Failed to download ${fileMeta.filename}:`, e.message);
                throw e; // Abort
            }
        }
    }
}
