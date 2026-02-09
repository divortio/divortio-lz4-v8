#!/usr/bin/env node

/**
 * src/lz4CLI.js
 * 
 * Command Line Interface for LZ4-Divortio.
 */

import { parseArgs } from './cli/cliArgs.js';
import * as compressor from './cli/cliCompress.js';
import * as decompressor from './cli/cliDecompress.js';

import { showHelp } from './cli/cliHelp.js';

const config = parseArgs();

if (config.isHelp) {
  showHelp(config.command);
  process.exit(0);
}

if (config.command === 'compress') {
  if (config.useStream) {
    await compressor.runStream(config);
  } else {
    compressor.run(config);
  }
} else if (config.command === 'decompress') {
  if (config.useStream) {
    await decompressor.runStream(config);
  } else {
    decompressor.run(config);
  }
} else {
  // If no command matched but args parsed, likely default was 'compress' 
  // but cliArgs defaults that.
  // If valid command but logic reached here? Unlikely.
  // parseArgs handles command detection.

  // Fallback
  console.error(`Unknown command: ${config.command}`);
  showHelp();
  process.exit(1);
}
