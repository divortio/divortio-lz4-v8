
import path from 'path';
import { execSync } from 'child_process';
import fs from "fs";


/**
 * Creates a tarball of the specified corpus if it contains files.
 * @param dir {string}
 * @param name {string}
 * @returns {string} Absolute path to the created .tar file.
 */
export  const tarDirectory = function (dir, name) {

    const tarPath = path.join(dir, `${name}.tar`);

    // remove existing file if exists
    if (fs.existsSync(tarPath)) {
        try {
            fs.unlinkSync(tarPath);
        } catch (e) {
            // ignore
        }
    }

    // 5. Build Tar Command
    try {
        execSync(`tar --exclude="${path.basename(tarPath)}" -cf "${path.basename(tarPath)}" *`, {
            cwd: this.directory,
            stdio: 'ignore' // Suppress output
        });

    } catch (e) {
        throw new Error(`Failed to create tarball for ${name}: ${e.message}`);
    }

    if (!fs.existsSync(tarPath)) {
        throw new Error(`Tarball creation failed (file missing): ${tarPath}`);
    }
    return tarPath;
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


export default {extractTar, tarDirectory};