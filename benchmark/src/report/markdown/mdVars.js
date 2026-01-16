/**
 * benchmark/src/report/markdown/mdVars.js
 * 
 * Maps template variable placeholders to their generator functions.
 * Used by mdReport.js to populate templates.
 */

import { generateSysInfoTable } from './mdTableSysInfo.js';
import { generateConfigTable } from './mdTableConfig.js';
import { generateInputsTable } from './mdTableInputs.js';
import { generateLibsTable } from './mdTableLibs.js';
import { generateResultsTable } from './mdTableResults.js';
import { generateResultsAggTable } from './mdTableResultsAgg.js';
import { generateSummaryTable } from './mdTableSummary.js';
import { generateCLIArgsBlock } from './mdCLIArgs.js';
import { MermaidXYResults } from '../mermaid/mermaidXYResults.js';
import { formatTimeWithOffset } from './mdTableBase.js';

export const MD_VARS = {
    // Standard Metadata
    // 18601 at UTC ex: 2026-01-11T22:14:38.915Z
    '%DATE%': () => new Date().toISOString(),
    // 18601 at system timezone ex: 2026-01-11T17:14:38.225-05:00
    '%DATEZ%': () => formatTimeWithOffset(new Date()),

    // Tables
    '%TABLE_SYSINFO%': (results) => generateSysInfoTable(results.sysInfo),
    '%TABLE_CONFIG%': (results) => generateConfigTable(results.config),
    '%TABLE_INPUTS%': (results) => generateInputsTable(results.config.inputs),
    '%TABLE_LIBS%': (results) => generateLibsTable(results.config.libs),

    // Results
    '%TABLE_SUMMARY%': (results) => generateSummaryTable(results),
    '%TABLE_RESULTS_AGG%': (results) => generateResultsAggTable(results),
    '%TABLE_RESULTS%': (results) => generateResultsTable(results),

    // Visuals
    '%CHART_THROUGHPUT%': (results) => MermaidXYResults.generateMetricChart(results, 'throughput'),
    '%CLI_ARGS_BLOCK%': (results) => generateCLIArgsBlock(results.config)
};
