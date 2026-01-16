/**
 * benchmark/src/report/markdown/mdCLIArgs.js
 * 
 * Generates the CLI command markdown block.
 */

/**
 * Returns a markdown code block containing the CLI arguments.
 * @param {BenchConfig} config 
 * @param {string} [command='node benchRun.js'] - The base command or script name.
 * @returns {string}
 */
export function generateCLIArgsBlock(config, command = 'node benchRun.js') {
    if (!config || typeof config.getCLIParts !== 'function') return '';

    const parts = config.getCLIParts();

    // Join with backslash newline and indentation
    const args = parts.join(' \\\n  ');

    // Wrap in bash code block
    return '```bash\n' + command + ' \\\n  ' + args + '\n```';
}
