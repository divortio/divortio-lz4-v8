
import { test } from 'node:test';
import assert from 'node:assert';
import { xxHash32 } from '../../src/xxhash32/xxhash32.js';
import { XXHash32 } from '../../src/xxhash32/xxhash32Stateful.js';

test('xxHash32: Functional (One-Shot)', (t) => {
    const input = Buffer.from("test");
    // xxhash32 seed 0 of "test" -> 0x3e2023cf (Decimal: 1042293711)
    const hash = xxHash32(input, 0);
    assert.strictEqual(hash, 1042293711);
});

test('XXHash32: Stateful', (t) => {
    const hasher = new XXHash32(0);
    hasher.update(Buffer.from("te"));
    hasher.update(Buffer.from("st"));
    const hash = hasher.digest();
    assert.strictEqual(hash, 1042293711);
});
