/**
 * benchmark/src/profile/src/profileV8.js
 * 
 * Standard Node.js CPU Profiling: Tick -> Process -> JSON.
 */

import fs from 'fs';
import { ProfileBase } from './profileBase.js';
import { ProfileTick } from './profileTick.js';
import { ProfileTickProc } from './profileTickProc.js';
import { ProfileTickProcMetaFile } from './outputs/profileTickProcMetaFile.js';
import { ProfileTickProcMetaMarkdown } from './outputs/profileTickProcMetaMarkdown.js';
import { ProfileTickProcMeta } from './profileTickProcMeta.js';

export class ProfileV8 extends ProfileBase {
    /**
     * @param {string} libraryName 
     * @param {object} config 
     * @param {string[]} commandArgs 
     * @param {string} scriptPath
     */
    constructor(libraryName, config, commandArgs, scriptPath) {
        super(libraryName, config);
        this.commandArgs = commandArgs;
        this.scriptPath = scriptPath;
    }

    run() {
        // 1. Run Tick Profiler
        const tickRunner = new ProfileTick(this.libraryName, this.config, this.commandArgs, this.scriptPath);
        const tickFile = tickRunner.run();

        // 2. Process Log
        // 2. Process Log (Generates Text and JSON)
        const procRunner = new ProfileTickProc(this.libraryName, this.config, tickFile);
        const { text: procFile, json: jsonFile } = procRunner.run();

        // 3. Meta Analysis (Optional)
        let metaFile = null;
        let metaMdFile = null;

        if (this.config.meta || this.config.metaMd) {
            // Load JSON
            const jsonPath = jsonFile.path;
            const procJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

            // Analyze
            // Class imported statically at top
            const analyzer = new ProfileTickProcMeta(procJson);
            const insights = analyzer.analyze();
            insights.library = this.libraryName;
            insights.summary = { duration: 'TODO' }; // Populate from config/result?

            if (this.config.meta) {
                metaFile = new ProfileTickProcMetaFile(tickFile.dir, this.libraryName, tickRunner.startTimestamp);
                metaFile.write(insights);
                console.error(`[ProfileV8] Generated Meta JSON: ${metaFile.path}`);
            }

            if (this.config.metaMd) {
                metaMdFile = new ProfileTickProcMetaMarkdown(tickFile.dir, this.libraryName, tickRunner.startTimestamp);
                metaMdFile.write(insights);
                console.error(`[ProfileV8] Generated Meta MD: ${metaMdFile.path}`);
            }
        }

        return {
            tick: tickFile,
            proc: procFile,
            procJson: jsonFile,
            meta: metaFile,
            metaMd: metaMdFile
        };
    }
}
