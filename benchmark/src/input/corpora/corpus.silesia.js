import path from "path";
import fs from "fs";
import {downloadFile} from "../../utils/http.js";
import {extractTar} from "../../utils/tar.js";

import {CorpusFile} from "../file/corpusFile.js";
import {CorpusFiles} from "../file/corpusFiles.js";

/**
 *
 * @class {CorpusSilesia}
 * @extends {CorpusFiles}
 */
export class CorpusSilesia extends CorpusFiles {

    constructor() {

        const u = "https://github.com/DataCompression/corpus-collection/raw/refs/heads/main/Silesia-Corpus/silesia.tar.gz";
        const n = 'silesia';
        const d = 'The Silesia Corpus is a collection of files used for compression testing';
        const f = [
            new CorpusFile(n, 'dickens', 10192446),
            new CorpusFile(n, 'mozilla', 51220480),
            new CorpusFile(n, 'mr', 9970564),
            new CorpusFile(n, 'nci', 33553445),
            new CorpusFile(n, 'ooffice', 6152192),
            new CorpusFile(n, 'osdb', 10085684),
            new CorpusFile(n, 'reymont', 6627202),
            new CorpusFile(n, 'samba', 21606400),
            new CorpusFile(n, 'sao', 7251944),
            new CorpusFile(n, 'webster', 41458703),
            new CorpusFile(n, 'x-ray', 8474240),
            new CorpusFile(n, 'xml', 5345280)
        ]
        super(n, f, d, u);
    }


    /**
     *
     * @returns {boolean}
     */
    async cache() {

        if (this._exists()) {
            console.log(`✅ ${this.corpus} corpus already exists in cache.`);
            return true;
        }

        // Ensure directory
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }
        const tarPath = path.join(this.directory, 'silesia.tar.gz');
        try {
            await downloadFile(this.url, tarPath);
            extractTar(tarPath, this.directory);
            fs.unlinkSync(tarPath); // Cleanup
        } catch (e) {
            console.error(`❌ Failed to cache ${this.corpus}:`, e.message);
            fs.unlinkSync(tarPath);
            throw e;
        }
        return this._exists() === true;
    }
}
