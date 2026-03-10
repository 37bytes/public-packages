# Technical Debt: @37bytes/code-style

## Known Issues

### Boolean Naming Plugin TypeScript Dependency

- **Status**: Accepted
- The `boolean-naming` plugin requires TypeScript type information
- Cannot be used in pure JavaScript projects without TypeScript parser

### eslint-config-biome is Static

- **Status**: Accepted
- Disables ~529 rules statically, doesn't know about our non-recommended Biome rules
- We maintain `biome/eslint-overrides.js` (29 rules) manually
- Re-check overrides list when updating Biome or adding rules

---

## Test Coverage Gaps

### Integration Tests

- 221 tests passing (fixtures, hybrid idempotency, FSD e2e, naming-conventions, plugin unit tests)
- Missing bad fixtures: `@ts-ignore` vs `@ts-expect-error`, enum naming, event handlers, props destructuring with boolean rename
- Missing: config composition tests, rule conflict detection between plugins
