import {BenchLib} from "../shared/benchLib.js";
import V8WASMLz4WasmWeb from "./v8WASM/v8WASM.lz4WasmWeb.js";



/**
 * @const V8WASMLibs
 * @type {{lz4WASMWeb: BenchLib}}
 */
export const V8WASMLibs = {
    lz4WASMWeb: new BenchLib( new V8WASMLz4WasmWeb()),
};


export default {V8WASMLibs};