/**
 * benchmark/src/profile/src/outputs/profileTickProcMetaMarkdown.js
 * 
 * Generates markdown report from Profile Meta Analysis.
 */

import fs from 'fs';
import { ProfileFile } from './profileFile.js';

export class ProfileTickProcMetaMarkdown extends ProfileFile {
    constructor(dir, libName, timestamp) {
        const filename = `profTickProcMeta_${libName}_${timestamp}.meta.md`;
        super(dir, filename);
    }

    write(insights) {
        let md = `# Profile Analysis: ${insights.library || 'Unknown'}\n\n`;
        md += `**Date**: ${new Date().toISOString()}\n`;
        md += `**Duration**: ${insights.summary?.duration || 'N/A'}\n\n`;

        md += `## Summary
- **Ticks**: ${insights.summary?.ticks || 0}
- **Breakdown**: 
    - JS: ${insights.executionBreakdown?.javascript || 0}
    - C++: ${insights.executionBreakdown?.cpp || 0}
    - GC: ${insights.executionBreakdown?.gc || 0}

## Hot JS Functions
| Function | Status | Ticks | % |
| :--- | :--- | :--- | :--- |
${insights.hotJsFunctions.map(f => `| \`${f.name}\` | ${f.status} | ${f.count} | ${f.percentage} |`).join('\n')}

## Hot C++ Functions
| Function | Status | Ticks | % |
| :--- | :--- | :--- | :--- |
${insights.hotCppFunctions.map(f => `| \`${f.name}\` | ${f.status} | ${f.count} | ${f.percentage} |`).join('\n')}
`;

        fs.writeFileSync(this.path, md);
    }
}
