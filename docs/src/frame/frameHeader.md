# frameHeader

[🏠 Home](../README.md) > [Frame](README.md) > frameHeader

Source: [`src/frame/frameHeader.js`](../../../../src/frame/frameHeader.js)

## Function: `writeFrameHeader`
-   **Role**: Writes the Magic Number, FLG byte, BD byte, optional Content Size, optional Dict ID, and Header Checksum.
-   **Specs**: Adheres to LZ4 Frame Format v1.6.1.

## Function: `getBlockId`
-   **Role**: Maps integer block sizes (e.g., 65536) to their ID (4-7) for the BD byte.
