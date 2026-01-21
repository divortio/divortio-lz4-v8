/**
 * benchmark/src/profile/shared/profileCLI.js
 * 
 * Shared CLI handling for profile commands.
 */

import { parseArgs } from '../../bench/shared/benchCLI.js';

// We can likely reuse parseArgs from benchCLI since we want to support the same flags.
// But we might need to intercept --help or add profile-specific flags if they aren't there.
// The user mentioned: --logfile, --diagnostic-dir, --no-logfile-per-isolate are Node flags.
// But we are wrapping them.
// Wait, the USER CLI command is: `bench.js profile compress ...`
// So we need to parse that.
// If we use `parseArgs`, we get { libraryNames, inputNames, corpusNames, samples, warmups }.
// We also need to extract profile args if we support them as user-args to the wrapper?
// The user said: "Our profile wrapper around the benchmark should only support a subset and whitelist of benchmark arguments."
// And: "Handling of profile arguments should supercede..."
// "Our profile command may include a --format command..." (Future)
// "For example... --format is currently used by benchmark... we should error or silently ignore"

export { parseArgs }; 
