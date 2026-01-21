# Todo: WebWorker

[🏠 Home](../src/README.md) > [WebWorker](../src/webWorker/README.md)

Source: [`src/webWorker`](../../src/webWorker/)

## Compat
- [ ] **Module Worker Fallback**:
    -   **Context**: `new Worker(..., { type: 'module' })` is not supported in all environments.
    -   **Task**: Consider a non-module fallback or a build step bundle.
