import {InputFiles} from "./inputFiles.js";
import {CorpusFile} from './corpusFile.js';
import {CORPORA_DIR} from "../../../config.js";
import path from "path";
import {tarDirectory} from "../../utils/tar.js";
import {InputFile} from "./inputFile.js";

/**
 * @class CorpusFiles
 * @extends InputFiles
 */
export class CorpusFiles extends InputFiles {


    /**
     * @type {string}
     */
    directory;

    /**
     * @param corpus {string}
     * @param inputFiles {CorpusFile[]|InputFile[]}
     * @param description {string|null}
     * @param url {string|null}
     */
    constructor( corpus='CORPUS', inputFiles=[], description=null, url=null) {
        super(inputFiles, corpus, description, url);
        this.directory = path.join(CORPORA_DIR, this.corpus);
    }


    /**
     * Creates a tarball of the specified corpus if it contains files.
     * @returns {InputFile} Instance of InputFile pointing to the tar file
     */
     toTarFile() {
        const tarPath = tarDirectory(this.directory, this.corpus);
        return new InputFile(tarPath, this.corpus);
    }

}


export default {CorpusFiles}