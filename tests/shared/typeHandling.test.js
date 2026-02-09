
import { test } from 'node:test';
import assert from 'node:assert';
import { compressString, decompressString, compressObject, decompressObject } from '../../src/shared/typeHandling.js';

test('typeHandling: String', (t) => {
    const s = "Hello World UTF8 🚀";
    const compressed = compressString(s);
    const result = decompressString(compressed);
    assert.strictEqual(result, s);
});

test('typeHandling: Object', (t) => {
    const obj = { foo: "bar", baz: 123, nested: { a: 1 } };
    const compressed = compressObject(obj);
    const result = decompressObject(compressed);
    assert.deepStrictEqual(result, obj);
});
