
import { decompressBlock } from '../../src/block/blockDecompress.js';
import { compressBlock } from '../../src/block/blockCompress.js';

// Configuration
const ITERATIONS = 10000;
const MAX_INPUT_SIZE = 4096;
const MAX_OUTPUT_SIZE = 65536;

// Statistics
let passed = 0;
let caught = 0;
let errors = {};

console.log(`Starting Fuzz Test: ${ITERATIONS} iterations...`);

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function generateRandomBuffer(size) {
    const buf = new Uint8Array(size);
    for (let i = 0; i < size; i++) buf[i] = getRandomInt(256);
    return buf;
}

// 1. Dumb Fuzzing
console.log("\n--- Phase 1: Random Garbage ---");
for (let i = 0; i < ITERATIONS; i++) {
    const inputSize = getRandomInt(MAX_INPUT_SIZE);
    const input = generateRandomBuffer(inputSize);
    const output = new Uint8Array(MAX_OUTPUT_SIZE);
    
    try {
        decompressBlock(input, 0, inputSize, output, 0);
        // If it returns, that's "Pass" (it might just be empty output or valid sequences by luck)
        passed++;
    } catch (e) {
        caught++;
        const msg = e.message || String(e);
        errors[msg] = (errors[msg] || 0) + 1;
    }
    
    if (i % 1000 === 0) process.stdout.write('.');
}

// 2. Smart Fuzzing (Mutation)
console.log("\n\n--- Phase 2: Mutation Fuzzing ---");
const seedData = new Uint8Array(1024);
for(let i=0; i<seedData.length; i++) seedData[i] = i % 255; 

// Compress seed
const compressedBuffer = new Uint8Array(2048);
const hashTable = new Int32Array(16384);
const compSize = compressBlock(seedData, compressedBuffer, 0, seedData.length, hashTable, 0);
const validBlock = compressedBuffer.subarray(0, compSize);

for (let i = 0; i < ITERATIONS; i++) {
    // Clone valid block
    const input = new Uint8Array(validBlock);
    
    // Mutate 1-5 random bytes
    const mutations = getRandomInt(5) + 1;
    for (let m=0; m<mutations; m++) {
        const pos = getRandomInt(input.length);
        input[pos] = getRandomInt(256);
    }
    
    const output = new Uint8Array(MAX_OUTPUT_SIZE);
    
    try {
        decompressBlock(input, 0, input.length, output, 0);
        passed++;
    } catch (e) {
        caught++;
        const msg = e.message || String(e);
        errors[msg] = (errors[msg] || 0) + 1;
    }
    
    if (i % 1000 === 0) process.stdout.write('.');
}

// 3. Output Overflow Fuzzing
console.log("\n\n--- Phase 3: Output Overflow ---");
for (let i = 0; i < 1000; i++) {
    // Generate valid compressed data but give it a too-small output buffer
    const input = new Uint8Array(validBlock); // Matches 1024 bytes
    const smallOutput = new Uint8Array(getRandomInt(1023)); // Limit < 1024
    
    try {
        decompressBlock(input, 0, input.length, smallOutput, 0);
        // Should FAIL
        console.error("FAIL: Managed to decompress into too small buffer without error!");
    } catch (e) {
        if (e.message.includes("Output Buffer Too Small")) {
            passed++;
        } else {
             caught++;
             const msg = e.message || String(e);
             errors[msg] = (errors[msg] || 0) + 1;
        }
    }
}

console.log("\n\n=== Results ===");
console.log(`Passed (Valid/Handled): ${passed}`);
console.log(`Caught (Errors): ${caught}`);
console.log("Error Types:");
console.table(errors);

console.log("Fuzzing Complete.");
