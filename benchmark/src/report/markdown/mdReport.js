/**
 * benchmark/src/report/markdown/mdReport.js
 * 
 * Compiles a full markdown report using templates and generator primitives.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MD_VARS } from './mdVars.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_RESULTS_DIR = path.resolve(__dirname, '../../../results');

export class MarkdownReport {
    constructor(benchResults) {
        this.results = benchResults;
        this.templates = {};
    }

    /**
     * Loads template files from the current directory.
     * Loads all .md files.
     */
    loadTemplates() {
        const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.md'));

        for (const file of files) {
            const name = path.basename(file, '.md');
            const content = fs.readFileSync(path.join(__dirname, file), 'utf-8');
            this.templates[name] = content;
        }
    }

    /**
     * Generates the report content.
     * @returns {string}
     */
    generate() {
        // 1. Get Master Template
        let report = this.templates['mdReport'] || '';
        if (!report) {
            // Fallback if master template missing
            return 'Error: mdReport.md template missing.';
        }

        // 2. Recursive Template Expansion
        // specific placeholder syntax: %mdTemplateName%
        // We loop until no more template placeholders match
        let hasTemplate = true;
        const maxDepth = 10;
        let depth = 0;

        while (hasTemplate && depth < maxDepth) {
            hasTemplate = false;
            report = report.replace(/%md([a-zA-Z0-9_]+)%/g, (match, tmplName) => {
                const key = `md${tmplName}`;
                if (this.templates[key] !== undefined) {
                    hasTemplate = true; // Found one, keep looping
                    return this.templates[key];
                }
                return match; // Keep as is if not found (or remove?)
            });
            depth++;
        }

        // 3. Variable Substitution via MD_VARS
        for (const [key, generator] of Object.entries(MD_VARS)) {
            if (report.includes(key)) {
                try {
                    const value = generator(this.results);
                    report = report.replace(new RegExp(key, 'g'), value);
                } catch (err) {
                    console.error(`Error generating content for ${key}:`, err);
                    report = report.replace(new RegExp(key, 'g'), '(Error Generating Content)');
                }
            }
        }

        return report;
    }

    /**
     * Writes the report to file.
     * @param {string} [filename]
     */
    save(filename) {
        if (!fs.existsSync(DEFAULT_RESULTS_DIR)) {
            fs.mkdirSync(DEFAULT_RESULTS_DIR, { recursive: true });
        }

        // Handle full paths or relative filenames
        let filePath;
        if (filename && path.isAbsolute(filename)) {
            filePath = filename;
            // Ensure dir exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        } else {
            // If relative, assume relative to DEFAULT_RESULTS_DIR
            // UNLESS it starts with .. which implies relative to CWD?
            // Standard behavior: save(filename) saves to results dir.
            const name = filename || `report_${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
            filePath = path.join(DEFAULT_RESULTS_DIR, name);
        }

        const content = this.generate();
        fs.writeFileSync(filePath, content, 'utf-8');
        // console.log(`Report generated: ${filePath}`);
        return filePath;
    }
}
