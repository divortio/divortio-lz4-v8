import path from "path";
import {fileURLToPath} from "url";



// Central Cache Directory

/**
 *
 * @type {string}
 */
export const CACHE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.cache');

/**
 *
 * @type {string}
 */
export const CORPORA_DIR = path.join(CACHE_DIR, 'corpora');


/**
 *
 * @type {{CACHE_DIR: string, CORPORA_DIR: string}}
 */
export const BENCH_CONFIG = {
    CACHE_DIR,
    CORPORA_DIR
};

export default {CORPORA_DIR, CACHE_DIR, BENCH_CONFIG};