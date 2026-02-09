
import { test } from 'node:test';
import assert from 'node:assert';
import { LZ4Dictionary } from '../../src/dictionary/LZ4Dictionary.js';

test('LZ4Dictionary: Creation', (t) => {
    const dictData = Buffer.from("test dictionary ".repeat(10));
    const dict = new LZ4Dictionary(dictData);

    // Check internal properties derived from processing
    // Check internal properties
    assert.strictEqual(dict.window.toString(), dictData.toString());
    assert.strictEqual(dict.window.length, dictData.length);
    assert.ok(dict.tableSnapshot instanceof Int32Array);
    assert.ok(dict.id !== 0); // Should have a hash ID
});
