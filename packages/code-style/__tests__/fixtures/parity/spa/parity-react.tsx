'use client'; // not required for spa but harmless; marks client boundary

// parity: Stale 'no equivalent' comment + missing Biome rule: noNestedComponentDefinitions
// biome/rules/react.js:59 stale comment claims no equivalent, but noNestedComponentDefinitions exists in schema.
// ESLint: @eslint-react/no-nested-component-definitions = error
// Biome: noNestedComponentDefinitions NOT configured (comment says no equivalent — stale)
const Outer = () => {
    const Inner = () => <span>nested</span>; // parity: no-nested-component-definitions — ESLint=error; Biome=absent (stale comment)
    return (
        <div>
            <Inner />
        </div>
    );
};

// parity: Severity mismatch: noDangerouslySetInnerHtmlWithChildren is warn in ESLint/OxLint but error in Biome
// biome/eslint-overrides.js does NOT disable @eslint-react/dom-no-dangerously-set-innerhtml-with-children.
// Both fire in hybrid. Biome fires as error; ESLint fires as warn.
const Danger = ({ html }: { html: string }) => (
    <div // parity: noDangerouslySetInnerHtmlWithChildren — ESLint/OxLint=warn; Biome=error
        dangerouslySetInnerHTML={{ __html: html }}
    >
        child content
    </div>
);

// parity: OxLint enforces react/jsx-handler-names: error with no ESLint or Biome equivalent
// OxLint requires eventHandlerProps to be prefixed 'on', handlers to be prefixed 'handle'.
// ESLint @eslint-react has no equivalent rule. Biome has no equivalent.
const doSomething = () => {
    /* handler body intentionally empty */
};
const Component = () => (
    <button onClick={doSomething}>click</button> // parity: jsx-handler-names — OxLint=error (handler not prefixed 'handle'); ESLint/Biome=absent
);

// parity: Key-related split: OxLint react/jsx-key does not cover no-duplicate-key
// OxLint react/jsx-key only checks missing keys (no-missing-key)
// ESLint: @eslint-react/no-duplicate-key = error, @eslint-react/jsx-no-key-after-spread = error
// OxLint: only react/jsx-key (missing-key); duplicate-key and key-after-spread not covered
const items = [1, 2, 1];
const list = items.map((item) => <li key={item}>{item}</li>); // duplicate key=1 — ESLint=error; OxLint=silent

// parity: react/no-leaked-conditional-rendering has no OxLint equivalent
const count = 0;
const leaky = <div>{count && <span>text</span>}</div>; // parity: no-leaked-conditional-rendering — ESLint/Biome=error; OxLint=absent

// parity: react/jsx-no-undef: error in OxLint absent from ESLint react rules
// OxLint react/jsx-no-undef=error; ESLint uses no-undef (core, off in TS files) or TS type-checking
const Undefined = () => <UndefinedComponent />; // parity: jsx-no-undef — OxLint=error; ESLint=absent

// parity: biome useNamingConvention does not allow underscore-prefix variables (no leadingUnderscore exception).
// ESLint @typescript-eslint/naming-convention has leadingUnderscore:'allow'; biome has no such option.
// Suppressed here by using a valid camelCase name to avoid fixture noise.
const handlers = { doSomething };
export { Outer, Danger, Component, list, leaky, Undefined, handlers };
