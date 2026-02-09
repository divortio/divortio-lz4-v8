import path from "path";
import fs from "fs";
import {downloadFile} from "../../utils/http.js";
import {extractTar} from "../../utils/tar.js";

import {CorpusFile} from "../file/corpusFile.js";
import {CorpusFiles} from "../file/corpusFiles.js";

/**
 *
 * @class {CorpusLZ4Flex}
 * @extends {CorpusFiles}
 */
export class CorpusLZ4Flex extends CorpusFiles {

    constructor() {

        const u = "https://github.com/PSeitz/lz4_flex/tree/main/benches";
        const n = 'lz4_flex';
        const d = 'Benchmark datasets provided by the high performance `rust` lz4_flex package.';
        const f = [
            new CorpusFile(n, 'dickens.lz4', 0, 'dickens.lz4', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/dickens.lz4'),
            new CorpusFile(n, 'compress_1k.txt', 0, 'compress_1k.txt', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/compression_1k.txt'),
            new CorpusFile(n, 'compression_34k.txt', 0, 'compress_34k.txt', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/compression_34k.txt'),
            new CorpusFile(n, 'compress_65k.txt', 0, 'compress_65k.txt', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/compression_65k.txt'),
            new CorpusFile(n, 'compress_66k_JSON.txt', 0, '', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/compression_66k_JSON.txt'),
            new CorpusFile(n, 'dickens.txt', 0, 'dickens.txt', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/dickens.txt'),
            new CorpusFile(n, 'hdfs.json', 0, 'hdfs.json 6.7MB', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/hdfs.json'),
            new CorpusFile(n, 'reymont.pdf', 0, 'reymont.pdf', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/reymont.pdf'),
            new CorpusFile(n, 'xml_collection.xml', 0, 'xml_collection.xml', 'https://github.com/PSeitz/lz4_flex/raw/refs/heads/main/benches/xml_collection.xml'),
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


        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, {recursive: true});
        }

        for (const file of this.files) {

            if (fs.existsSync(file.path)) {
                const stats = fs.statSync(file.path);
                if (stats.size > 0) {
                    return true // Skip
                }
                try {
                    await downloadFile(file.url, file.path);
                } catch (e) {
                    console.error(`❌ Failed to download ${file.filename} from ${file.corpus} URL: ${file.url}`, e.message);
                    throw e; // Abort
                }
            }
        }
        return true;
    }


}
