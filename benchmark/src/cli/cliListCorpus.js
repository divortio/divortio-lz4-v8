/**
 * benchmark/src/cli/cliListCorpus.js
 * 
 * Lists available corpora and their files.
 */

// import { Corpus } from '../corpus/corpus.js'; // Removed static import
import { formatBytes } from '../report/markdown/mdTableBase.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export function run(args) {
    let Corpus;
    try {
        Corpus = require('../../.cache/corpus/corpus.json');
    } catch (e) {
        console.log('Corpus index not found. Please run: node benchmark/bench.js buildCorpus');
        return;
    }

    const filterName = (args.unknown && args.unknown.length > 0) ? args.unknown[0] : null;

    const corpora = Object.entries(Corpus);

    if (corpora.length === 0) {
        console.log('No corpora available.');
        return;
    }

    console.log('Available Corpora & Files:');
    console.log('Use via -c <corpus> or -i <corpus>.<file>');
    console.log('');

    for (const [corpusName, filesObj] of corpora) {
        // Filter support? If pattern matches corpus name OR any file.
        // Let's implement simple includes matches if filter present.

        const files = Object.values(filesObj);

        let showCorpus = true;
        let filteredFiles = files;

        if (filterName) {
            const pattern = filterName.toLowerCase();
            const corpusMatches = corpusName.toLowerCase().includes(pattern);

            if (corpusMatches) {
                // Show all
                showCorpus = true;
            } else {
                // Check files
                filteredFiles = files.filter(f => f.name.toLowerCase().includes(pattern));
                showCorpus = filteredFiles.length > 0;
            }
        }

        if (!showCorpus) continue;

        console.log(`📦 ${corpusName} (${files.length} files)`);

        for (const file of filteredFiles) {
            const sizeStr = formatBytes(file.size);
            console.log(`  📄 ${file.name.padEnd(20)} [${sizeStr}]`);
        }
        console.log('');
    }
}
