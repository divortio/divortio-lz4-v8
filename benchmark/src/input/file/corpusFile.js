/**
 * benchmark/inputs/corpusFile.js
 * 
 * Represents a single file from a specific Corpus.
 * Automatically resolves the file path using the CorpusCatalog.
 */

import path from 'path';
import {InputFile} from "./inputFile.js";
import {CORPORA_DIR} from "../../../config.js";

/**
 *
 * @class CorpusFile
 * @extends InputFile
 */
export class CorpusFile extends InputFile {

    /**
     *
     * @param corpusName {string}
     * @param filename {string}
     * @param size {number}
     * @param description {string|null}
     * @param url {string|null}
     */
    constructor(corpusName, filename, size=0, description=null, url=null) {
        const corpusDir = path.join(CORPORA_DIR, corpusName);
        const filepath = path.join(corpusDir, filename);
        super(filepath, corpusName, size, description, url);
    }
}
