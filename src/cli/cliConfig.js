/**
 * src/cli/cliConfig.js
 * 
 * Helper class for managing the CLI configuration state.
 * Encapsulates command-line arguments, default values, and validation logic.
 */

import path from 'path';

/**
 * Class representing the CLI Configuration options.
 */
export class CLIConfig {
    /**
     * Create a CLI configuration instance.
     * @param {object} [options={}] - The configuration options.
     */
    constructor(options = {}) {
        /**
         * The command to execute (e.g., 'compress', 'decompress').
         * @type {string}
         */
        this.command = options.command || 'compress';

        /**
         * Path to the input file.
         * @type {string|null}
         */
        this.input = options.input || null;

        /**
         * Path to the output file.
         * @type {string|null}
         */
        this.output = options.output || null;

        /**
         * Whether to overwrite existing output files.
         * @type {boolean}
         */
        this.force = !!options.force;

        /**
         * Whether to keep the input file after processing.
         * @type {boolean}
         */
        this.keep = options.keep !== undefined ? !!options.keep : true;

        /**
         * Whether to output verbose logs.
         * @type {boolean}
         */
        this.verbose = !!options.verbose;

        /**
         * Whether to output strictly JSON results.
         * @type {boolean}
         */
        this.json = !!options.json;

        /**
         * Whether to log results to a file.
         * @type {boolean}
         */
        this.log = !!options.log;

        /**
         * Custom path for log file.
         * @type {string|null}
         */
        this.logPath = options.logPath || null;

        /**
         * Format for the log file (e.g., 'json', 'csv').
         * @type {string}
         */
        this.logFormat = options.logFormat || 'json';

        /**
         * Compression block size in bytes.
         * @type {number}
         */
        this.blockSize = options.blockSize || 4194304;

        /**
         * Path to a specific dictionary file.
         * @type {string|null}
         */
        this.dictionary = options.dictionary || null;

        /**
         * Whether to use independent blocks (no inter-block dependencies).
         * @type {boolean}
         */
        this.blockIndependence = !!options.blockIndependence;

        /**
         * Whether to include content checksum in the frame.
         * @type {boolean}
         */
        this.contentChecksum = !!options.contentChecksum;

        /**
         * Whether to add content size to the frame header.
         * @type {boolean}
         */
        this.addContentSize = options.addContentSize !== undefined ? !!options.addContentSize : true;

        /**
         * (Decompress) Whether to verify checksums during decompression.
         * @type {boolean}
         */
        this.verifyChecksum = !!options.verifyChecksum;

        /**
         * Whether the help flag was invoked.
         * @type {boolean}
         */
        this.isHelp = !!options.isHelp;

        this._resolveDefaults();
    }

    /**
     * Resolves default values such as output filename based on input.
     * @private
     */
    _resolveDefaults() {
        if (this.input && !this.output) {
            if (this.command === 'compress') {
                // Default: input.lz4
                this.output = `${this.input}.lz4`;
            } else if (this.command === 'decompress') {
                // Default: remove .lz4 or append .out
                if (this.input.endsWith('.lz4')) {
                    this.output = this.input.substring(0, this.input.length - 4);
                } else {
                    this.output = `${this.input}.out`;
                }
            }
        }
    }

    /**
     * Validates the configuration.
     * @throws {Error} If configuration is invalid (e.g. missing input).
     */
    validate() {
        if (!this.input && !this.isHelp) {
            throw new Error('Input file required.');
        }
    }
}
