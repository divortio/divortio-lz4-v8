/**
 * benchmark/src/cli/cliCorpus.js
 * 
 * Central handler for Corpus-related CLI operations.
 * Routes input resolution to specific handlers for:
 * - Individual Corpus Files (cliCorpusFile)
 * - Full Corpus as listCorpora (cliCorpusFiles)
 * - Full Corpus as Tar (cliCorpusTar)
 */

import { resolveCorpusFile } from './cliCorpusFile.js';
import { resolveCorpusFiles } from './cliCorpusFiles.js';
import { resolveCorpusTar } from './cliCorpusTar.js';

/**
 * Resolves a raw input string to a listCorpora of InputFile objects if it matches corpus logic.
 * Priorities:
 * 1. Corpus Tar (silesia.tar, silesia.all)
 * 2. Corpus File (silesia.dickens)
 * 3. Full Corpus (silesia)
 * 
 * @param {string} rawName 
 * @returns {Array<InputFile>|null} Resolved inputs or null if not a corpus reference.
 */
export function resolveCorpusString(rawName) {
    // 1. Check Tar / All (.tar, .all)
    const tar = resolveCorpusTar(rawName);
    if (tar) return [tar];

    // 2. Check Specific File (dot notation or fuzzy)
    // Note: resolveCorpusFile might throw if it looks like a corpus but file missing? 
    // Or return null?
    // Current logic in `inputUtils` was aggressive.
    // We try specific first?
    // silesia.dickens -> resolveCorpusFile('silesia.dickens') -> CorpusFile
    // silesia -> resolveCorpusFile('silesia') -> null (matches directory/key, not file)

    const single = resolveCorpusFile(rawName);
    if (single) return [single];

    // 3. Check Full Corpus (expansion)
    const multiple = resolveCorpusFiles(rawName);
    if (multiple && multiple.length > 0) return multiple;

    return null;
}
