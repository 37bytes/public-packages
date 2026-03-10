# Roadmap: @37bytes/code-style

## Open Tasks

### Test Coverage

- [ ] Missing bad fixtures: `@ts-ignore` vs `@ts-expect-error`, enum naming, event handlers, props destructuring with boolean rename
- [ ] Config composition tests (combining spa + nextjs + storybook layers)

### CI/CD

- [ ] GitHub Actions for tests and publishing

### Pending Enhancements

- [ ] `boolean-naming/react` — enforce HTML-style boolean props in React components

---

## TypeScript 6 (blocked: waiting for @typescript-eslint support)

- [ ] Upgrade to TypeScript 6 (stable ~2026-03-17)
- [ ] Remove `esModuleInterop`, `allowSyntheticDefaultImports` (always-on in TS6)
- [ ] Add `types` to tsconfig templates: base `[]`, react `["react", "react-dom"]`, node `["node"]`
- [ ] Decide on `target`: keep ES2023 or bump to ES2025

---

## ESLint 10 (blocked: plugin ecosystem not ready)

- [ ] `eslint-plugin-import-x` needs `^10.0.0` peer dep
- [ ] `eslint-plugin-react-hooks` stable needs `^10.0.0` peer dep (canary 7.1.0 has it)

---

## tsgo (TypeScript 7, Go rewrite)

- [ ] Track [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940) for tsgo parser support
- [ ] Track [tsgolint](https://github.com/typescript-eslint/tsgolint) (Go-native linter)
- [ ] Test `extends` chains with tsgo
- [ ] Consider `tsgo --noEmit` as fast type-check in pre-commit/CI
