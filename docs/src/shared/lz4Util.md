# lz4Util

[🏠 Home](../README.md) > [Shared](README.md) > lz4Util

Source: [`src/shared/lz4Util.js`](../../../../src/shared/lz4Util.js)

## Function: `ensureBuffer`
-   **Role**: Coerces inputs (String, Array, View) into `Uint8Array`.
-   **Fix**: Previously had a bug with `new encoder.encode` (Fixed).

## Function: `hashU32`
-   **Role**: Performs Knuth Multiplicative Hash for match finders.
-   **Optimization**: Uses `Math.imul` for 32-bit safety.
