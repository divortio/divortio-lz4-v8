/**
 * benchmark/src/profile/shared/profileLibCatalog.js
 * 
 * Alias to library catalog/resolution logic.
 */

// Re-export functionality from cliLibs which is the modern catalog accessor
export { resolveLibrary, resolveLibraries } from '../../cli/cliLibs.js';
export { V8JSLibs, NodeJSLibs, V8WASMLibs } from '../../libraries/libCatalogs.js'; 
