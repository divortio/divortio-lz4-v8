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



export default { downloadFile };