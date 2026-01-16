/**
 * benchmark/src/corpus/catalog/corpusSilesia.js
 * 
 * Class definition for the Silesia Corpus.
 */

import { BaseCorpus } from '../shared/baseCorpus.js';
import { downloadFile, extractTar } from '../shared/cacheCorpus.js';
import path from 'path';
import fs from 'fs';

// Constants from corpus.silesia.js
export const SILESIA_META = {
    name: 'silesia',
    url: 'https://github.com/DataCompression/corpus-collection/raw/refs/heads/main/Silesia-Corpus/',
    description: 'The Silesia Corpus is a collection of files used for compression testing.',
    buildFile: 'cacheCorpus.silesia.js', // Legacy reference
    files: [
        { filename: 'dickens', size: 10192446 },
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

const TAR_URL = 'https://github.com/DataCompression/corpus-collection/raw/refs/heads/main/Silesia-Corpus/silesia.tar.gz';

export class CorpusSilesia extends BaseCorpus {
    constructor() {
        super(SILESIA_META);
    }

    async cache() {
        if (this.exists()) {
            console.log(`✅ ${this.name} corpus already exists in cache.`);
            return;
        }

        console.log(`Building ${this.name} corpus...`);

        // Ensure directory
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }

        // Silesia uses a single tarball download strategy
        const tarPath = path.join(this.cacheDir, 'silesia.tar.gz');

        try {
            await downloadFile(TAR_URL, tarPath);
            extractTar(tarPath, this.cacheDir);
            fs.unlinkSync(tarPath); // Cleanup
        } catch (e) {
            console.error(`❌ Failed to cache ${this.name}:`, e.message);
            throw e;
        }
    }
}
