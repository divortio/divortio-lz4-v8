/**
 * benchmark/src/corpus/shared/cacheCorpus.js
 * 
 * Shared utilities for downloading and caching corpus files.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Downloads a file from a URL to a local destination.
 * @param {string} url 
 * @param {string} destPath 
 */
export async function downloadFile(url, destPath) {
    console.log(`⬇️  Downloading ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    console.log(`   Saved to ${destPath}`);
}

/**
 * Extracts a tar.gz file to a destination directory using system tar.
 * @param {string} tarPath 
 * @param {string} destDir 
 */
export function extractTar(tarPath, destDir) {
    try {
        console.log(`📦 Extracting ${path.basename(tarPath)}...`);
        // -x: extract, -z: gzip, -f: file, -C: dir
        execSync(`tar -xzf "${tarPath}" -C "${destDir}"`);
        console.log('✨ Extraction complete.');
    } catch (e) {
        throw new Error(`Failed to extract tarball: ${e.message}`);
    }
}
